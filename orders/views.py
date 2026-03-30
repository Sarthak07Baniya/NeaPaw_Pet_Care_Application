import base64
import hashlib
import hmac
import json
import urllib.parse
import urllib.request
from decimal import Decimal
from uuid import uuid4

from django.conf import settings
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Order, Notification, ChatMessage
from .serializers import OrderSerializer, NotificationSerializer, ChatMessageSerializer
from rest_framework.views import APIView


def _format_amount(value):
    return format(Decimal(value).quantize(Decimal("0.01")), "f")


def _generate_esewa_signature(total_amount, transaction_uuid, product_code):
    payload = f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}"
    digest = hmac.new(
        settings.ESEWA_SECRET_KEY.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return base64.b64encode(digest).decode("utf-8")


def _fetch_esewa_status(transaction_uuid, total_amount):
    query = urllib.parse.urlencode({
        'product_code': settings.ESEWA_PRODUCT_CODE,
        'total_amount': total_amount,
        'transaction_uuid': transaction_uuid,
    })
    request_url = f"{settings.ESEWA_STATUS_URL}?{query}"
    with urllib.request.urlopen(request_url, timeout=15) as response:
        body = response.read().decode("utf-8")
    return json.loads(body)


def _decode_esewa_response(encoded_value):
    if not encoded_value:
        return {}
    padded = encoded_value + "=" * (-len(encoded_value) % 4)
    try:
        decoded = base64.b64decode(padded).decode("utf-8")
        return json.loads(decoded)
    except Exception:
        return {}


def _sync_order_from_esewa(order, transaction_uuid, provider_reference=None, payment_status=None):
    normalized_status = str(payment_status or '').upper()

    order.payment_provider = 'esewa'
    if transaction_uuid:
        order.transaction_uuid = transaction_uuid
    if provider_reference:
        order.provider_reference = provider_reference

    if normalized_status == 'COMPLETE':
        order.payment_status = 'paid'
        if not order.paid_at:
            order.paid_at = timezone.now()
        if order.order_type in {'shopping', 'treatment', 'hostel'} and order.status == 'pending':
            order.status = 'confirmed'
    elif normalized_status in {'PENDING', 'AMBIGUOUS'}:
        order.payment_status = 'pending'
    elif normalized_status:
        order.payment_status = 'failed'

    order.save(
        update_fields=[
            'payment_provider',
            'transaction_uuid',
            'provider_reference',
            'payment_status',
            'paid_at',
            'status',
            'updated_at',
        ]
    )

    if normalized_status == 'COMPLETE':
        linked_treatment_booking = getattr(order, 'linked_treatment_booking', None)
        if linked_treatment_booking and linked_treatment_booking.status == 'pending':
            linked_treatment_booking.status = 'confirmed'
            linked_treatment_booking.save(update_fields=['status', 'updated_at'])

        linked_hostel_booking = getattr(order, 'linked_hostel_booking', None)
        if linked_hostel_booking and linked_hostel_booking.status == 'pending':
            linked_hostel_booking.status = 'confirmed'
            linked_hostel_booking.save(update_fields=['status', 'updated_at'])


class AppSchemeHttpResponseRedirect(HttpResponseRedirect):
    allowed_schemes = ["http", "https", "ftp", settings.APP_DEEP_LINK_SCHEME]


def _build_client_redirect_response(target_url):
    escaped_url = target_url.replace("&", "&amp;").replace('"', "&quot;")
    html = f"""
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Redirecting</title>
      </head>
      <body style="font-family: sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; flex-direction:column; gap:16px;">
        <p>Redirecting back to the app...</p>
        <a href="{escaped_url}">Tap here if the app does not open automatically.</a>
        <script>
          window.location.replace("{escaped_url}");
        </script>
      </body>
    </html>
    """
    return HttpResponse(html)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .exclude(Q(order_type='treatment') & Q(linked_treatment_booking__isnull=True))
            .exclude(Q(order_type='hostel') & Q(linked_hostel_booking__isnull=True))
            .order_by('-created_at', '-id')
        )

    @action(detail=True, methods=['post'], url_path='esewa/initiate')
    def esewa_initiate(self, request, pk=None):
        order = self.get_object()
        callback_url = request.data.get('callback_url')

        if order.payment_method != 'esewa':
          order.payment_method = 'esewa'

        if not order.transaction_uuid:
            order.transaction_uuid = f"{order.id}-{uuid4().hex[:10].upper()}"

        order.payment_provider = 'esewa'
        order.payment_status = 'pending'
        order.save(update_fields=['payment_method', 'transaction_uuid', 'payment_provider', 'payment_status', 'updated_at'])

        checkout_url = request.build_absolute_uri(reverse('orders-esewa-checkout'))
        checkout_params = {
            'order_id': order.id,
            'transaction_uuid': order.transaction_uuid,
        }
        if callback_url:
            checkout_params['callback_url'] = callback_url
        checkout_url = f"{checkout_url}?{urllib.parse.urlencode(checkout_params)}"

        return Response({
            'order_id': order.id,
            'order_number': order.order_number,
            'transaction_uuid': order.transaction_uuid,
            'checkout_url': checkout_url,
        })

    @action(detail=True, methods=['get'], url_path='esewa/verify')
    def esewa_verify(self, request, pk=None):
        order = self.get_object()
        transaction_uuid = request.query_params.get('transaction_uuid') or order.transaction_uuid
        existing_payment_status = order.payment_status

        if not transaction_uuid:
            return Response({'detail': 'Missing transaction uuid.'}, status=status.HTTP_400_BAD_REQUEST)

        total_amount = _format_amount(order.total)
        try:
            status_payload = _fetch_esewa_status(transaction_uuid, total_amount)
        except Exception as error:
            return Response(
                {'detail': f'Unable to verify eSewa payment right now: {error}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        payment_status = str(status_payload.get('status') or '').upper()
        provider_reference = status_payload.get('ref_id') or status_payload.get('refId')
        if payment_status != 'COMPLETE' and existing_payment_status == 'paid':
            payment_status = 'COMPLETE'
        _sync_order_from_esewa(order, transaction_uuid, provider_reference, payment_status)

        return Response({
            'order_id': order.id,
            'order_number': order.order_number,
            'payment_status': order.payment_status,
            'status': payment_status,
            'ref_id': provider_reference,
        })

    @action(detail=True, methods=['get'])
    def track(self, request, pk=None):
        order = self.get_object()
        return Response({
            'order_number': order.order_number,
            'current_status': order.status,
            'estimated_delivery': order.estimated_delivery,
            'tracking_history': order.tracking_history.values()
        })

    @action(detail=True, methods=['get', 'post'])
    def chat(self, request, pk=None):
        order = self.get_object()
        if request.method == 'GET':
            messages = order.chat_messages.all()
            serializer = ChatMessageSerializer(messages, many=True, context={'request': request})
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = ChatMessageSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(order=order, sender=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})


class EsewaCheckoutView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        order_id = request.query_params.get('order_id')
        transaction_uuid = request.query_params.get('transaction_uuid')
        callback_url = request.query_params.get('callback_url')

        if not order_id or not transaction_uuid:
            return HttpResponse('Missing order parameters.', status=400)

        try:
            order = Order.objects.get(id=order_id, transaction_uuid=transaction_uuid)
        except Order.DoesNotExist:
            return HttpResponse('Invalid order reference.', status=404)

        total_amount = _format_amount(order.total)
        success_url = request.build_absolute_uri(reverse('orders-esewa-success'))
        success_params = {'order_id': order.id}
        if callback_url:
            success_params['callback_url'] = callback_url
        success_url = f"{success_url}?{urllib.parse.urlencode(success_params)}"
        failure_url = request.build_absolute_uri(reverse('orders-esewa-failure'))
        failure_params = {'order_id': order.id}
        if callback_url:
            failure_params['callback_url'] = callback_url
        failure_url = f"{failure_url}?{urllib.parse.urlencode(failure_params)}"
        signed_field_names = 'total_amount,transaction_uuid,product_code'
        signature = _generate_esewa_signature(total_amount, transaction_uuid, settings.ESEWA_PRODUCT_CODE)

        html = f"""
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Redirecting to eSewa</title>
          </head>
          <body style="font-family: sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh;">
            <form id="esewa-form" action="{settings.ESEWA_BASE_URL}" method="POST">
              <input type="hidden" name="amount" value="{total_amount}" />
              <input type="hidden" name="tax_amount" value="0" />
              <input type="hidden" name="total_amount" value="{total_amount}" />
              <input type="hidden" name="transaction_uuid" value="{transaction_uuid}" />
              <input type="hidden" name="product_code" value="{settings.ESEWA_PRODUCT_CODE}" />
              <input type="hidden" name="product_service_charge" value="0" />
              <input type="hidden" name="product_delivery_charge" value="0" />
              <input type="hidden" name="success_url" value="{success_url}" />
              <input type="hidden" name="failure_url" value="{failure_url}" />
              <input type="hidden" name="signed_field_names" value="{signed_field_names}" />
              <input type="hidden" name="signature" value="{signature}" />
              <p>Redirecting to eSewa...</p>
              <button type="submit">Continue to eSewa</button>
            </form>
            <script>document.getElementById('esewa-form').submit();</script>
          </body>
        </html>
        """
        return HttpResponse(html)


class EsewaSuccessRedirectView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        order_id = request.query_params.get('order_id')
        callback_url = request.query_params.get('callback_url')
        data = _decode_esewa_response(request.query_params.get('data'))
        transaction_uuid = data.get('transaction_uuid') or request.query_params.get('transaction_uuid') or ''
        status_value = str(data.get('status') or 'COMPLETE').upper()
        provider_reference = data.get('ref_id') or data.get('refId')

        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                _sync_order_from_esewa(order, transaction_uuid, provider_reference, status_value)
            except Order.DoesNotExist:
                pass

        app_status = 'success' if status_value == 'COMPLETE' else 'failure'
        redirect_base = callback_url or f"{settings.APP_DEEP_LINK_SCHEME}://payments/esewa"
        separator = '&' if '?' in redirect_base else '?'
        deep_link = f"{redirect_base}{separator}{urllib.parse.urlencode({'status': app_status, 'order_id': order_id, 'transaction_uuid': transaction_uuid})}"
        return _build_client_redirect_response(deep_link)


class EsewaFailureRedirectView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        order_id = request.query_params.get('order_id')
        callback_url = request.query_params.get('callback_url')
        transaction_uuid = request.query_params.get('transaction_uuid') or ''

        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                _sync_order_from_esewa(order, transaction_uuid, None, 'FAILED')
            except Order.DoesNotExist:
                pass

        redirect_base = callback_url or f"{settings.APP_DEEP_LINK_SCHEME}://payments/esewa"
        separator = '&' if '?' in redirect_base else '?'
        deep_link = f"{redirect_base}{separator}{urllib.parse.urlencode({'status': 'failure', 'order_id': order_id, 'transaction_uuid': transaction_uuid})}"
        return _build_client_redirect_response(deep_link)
