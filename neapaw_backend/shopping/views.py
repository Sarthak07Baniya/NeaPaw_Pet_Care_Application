from rest_framework import viewsets, permissions, filters, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Product, Review, Cart, CartItem, Coupon, Offer
from .serializers import (
    ProductSerializer, ReviewSerializer, CartSerializer, 
    CartItemSerializer, CouponSerializer, OfferSerializer
)

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'in_stock']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'rating', 'created_at']

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def reviews(self, request, pk=None):
        product = self.get_object()
        if request.method == 'GET':
            reviews = product.reviews.all()
            serializer = ReviewSerializer(reviews, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = ReviewSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user, product=product)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CartViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['product_id', 'quantity'],
            properties={
                'product_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                'quantity': openapi.Schema(type=openapi.TYPE_INTEGER, example=2),
            },
        ),
        responses={200: CartSerializer},
    )
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartItemSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.validated_data['product']
            quantity = serializer.validated_data['quantity']

            # Recover gracefully if older duplicate rows already exist for the same cart/product.
            items = CartItem.objects.filter(cart=cart, product=product).order_by('id')

            if items.exists():
                item = items.first()
                duplicate_items = items.exclude(id=item.id)

                if duplicate_items.exists():
                    item.quantity += sum(duplicate.quantity for duplicate in duplicate_items)
                    duplicate_items.delete()

                item.quantity += quantity
                item.save()
            else:
                CartItem.objects.create(cart=cart, product=product, quantity=quantity)
                
            return Response(CartSerializer(cart).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['item_id', 'quantity'],
            properties={
                'item_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
                'quantity': openapi.Schema(type=openapi.TYPE_INTEGER, example=3),
            },
        ),
        responses={200: CartSerializer},
    )
    @action(detail=False, methods=['post'])
    def update_item(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))
        
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        if quantity > 0:
            item.quantity = quantity
            item.save()
        else:
            item.delete()
            
        return Response(CartSerializer(cart).data)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['item_id'],
            properties={
                'item_id': openapi.Schema(type=openapi.TYPE_INTEGER, example=1),
            },
        ),
        responses={200: CartSerializer},
    )
    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        item_id = request.data.get('item_id')
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        item.delete()
        return Response(CartSerializer(cart).data)

class CouponViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Coupon.objects.filter(is_active=True)
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['code'],
            properties={
                'code': openapi.Schema(type=openapi.TYPE_STRING, example='NEAPAW10'),
            },
        ),
        responses={200: CouponSerializer},
    )
    @action(detail=False, methods=['post'])
    def apply(self, request):
        code = request.data.get('code')
        try:
            coupon = Coupon.objects.get(code=code, is_active=True)
            # Logic to calculate discount would go here
            return Response(CouponSerializer(coupon).data)
        except Coupon.DoesNotExist:
            return Response({"error": "Invalid coupon"}, status=status.HTTP_400_BAD_REQUEST)

class OfferViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Offer.objects.filter(is_active=True)
    serializer_class = OfferSerializer
    permission_classes = [permissions.AllowAny]

