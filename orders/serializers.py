from rest_framework import serializers
from .models import Order, OrderItem, OrderTracking, Notification, ChatMessage
from shopping.models import Cart
from shopping.serializers import ProductSerializer
from profiles.serializers import ShippingAddressSerializer
from profiles.models import ShippingAddress
from django.utils import timezone

class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTracking
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    tracking_history = OrderTrackingSerializer(many=True, read_only=True)
    shipping_address = ShippingAddressSerializer(required=False)
    treatment_booking_id = serializers.SerializerMethodField()
    hostel_booking_id = serializers.SerializerMethodField()
    treatment_pet_name = serializers.SerializerMethodField()
    treatment_name = serializers.SerializerMethodField()
    treatment_service_name = serializers.SerializerMethodField()
    treatment_service_type = serializers.SerializerMethodField()
    treatment_date = serializers.SerializerMethodField()
    treatment_time = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = (
            'user',
            'order_number',
            'status',
            'created_at',
            'updated_at',
            'total',
            'payment_provider',
            'payment_status',
            'transaction_uuid',
            'provider_reference',
            'paid_at',
        )

    def get_treatment_booking_id(self, obj):
        linked_booking = getattr(obj, 'linked_treatment_booking', None)
        return linked_booking.id if linked_booking else None

    def get_hostel_booking_id(self, obj):
        linked_booking = getattr(obj, 'linked_hostel_booking', None)
        return linked_booking.id if linked_booking else None

    def get_treatment_pet_name(self, obj):
        linked_booking = getattr(obj, 'linked_treatment_booking', None)
        return getattr(getattr(linked_booking, 'pet', None), 'name', None)

    def get_treatment_name(self, obj):
        linked_booking = getattr(obj, 'linked_treatment_booking', None)
        return getattr(getattr(linked_booking, 'treatment_type', None), 'name', None)

    def get_treatment_service_name(self, obj):
        linked_booking = getattr(obj, 'linked_treatment_booking', None)
        return getattr(getattr(linked_booking, 'treatment_type', None), 'name', None)

    def get_treatment_service_type(self, obj):
        linked_booking = getattr(obj, 'linked_treatment_booking', None)
        return linked_booking.get_service_type_display() if linked_booking else None

    def get_treatment_date(self, obj):
        linked_booking = getattr(obj, 'linked_treatment_booking', None)
        return linked_booking.appointment_date if linked_booking else None

    def get_treatment_time(self, obj):
        linked_booking = getattr(obj, 'linked_treatment_booking', None)
        return linked_booking.appointment_time if linked_booking else None

    def create(self, validated_data):
        shipping_address_data = validated_data.pop('shipping_address', None)
        validated_data['user'] = self.context['request'].user
        
        if shipping_address_data:
            # Create a new shipping address for the user
            shipping_address = ShippingAddress.objects.create(user=validated_data['user'], **shipping_address_data)
            validated_data['shipping_address'] = shipping_address

        # Order number generation and total calculation logic would go here
        import uuid
        validated_data['order_number'] = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        user = validated_data['user']

        if validated_data.get('order_type') == 'shopping':
            cart, _ = Cart.objects.get_or_create(user=user)
            cart_items = list(cart.items.select_related('product'))

            if not cart_items:
                raise serializers.ValidationError({
                    'items': 'Your cart is empty. Add products before placing an order.'
                })

            subtotal = sum(item.subtotal for item in cart_items)
            validated_data['subtotal'] = subtotal
            validated_data['total'] = subtotal + validated_data.get('tax', 0) + validated_data.get('shipping_fee', 0) - validated_data.get('discount', 0)
            if not validated_data.get('estimated_delivery'):
                validated_data['estimated_delivery'] = timezone.localdate() + timezone.timedelta(days=3)

            order = super().create(validated_data)

            OrderItem.objects.bulk_create([
                OrderItem(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price_at_time=item.product.price,
                )
                for item in cart_items
            ])

            cart.items.all().delete()
            order.add_tracking(order.status, "Order has been placed successfully.")
            return order

        validated_data['total'] = validated_data['subtotal'] + validated_data.get('tax', 0) + validated_data.get('shipping_fee', 0) - validated_data.get('discount', 0)
        order = super().create(validated_data)
        order.add_tracking(order.status, "Order has been placed successfully.")
        return order

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.get_full_name')

    class Meta:
        model = ChatMessage
        fields = ('id', 'order', 'sender', 'sender_name', 'message', 'timestamp', 'is_admin_reply')
        read_only_fields = ('order', 'sender', 'timestamp', 'is_admin_reply')

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['sender'] = request.user
        return super().create(validated_data)
