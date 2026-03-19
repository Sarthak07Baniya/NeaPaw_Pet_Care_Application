from rest_framework import serializers
from .models import Order, OrderItem, OrderTracking, Notification, ChatMessage
from shopping.serializers import ProductSerializer
from profiles.serializers import ShippingAddressSerializer
from profiles.models import ShippingAddress

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

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('user', 'order_number', 'status', 'created_at', 'updated_at', 'total')

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
        validated_data['total'] = validated_data['subtotal'] + validated_data.get('tax', 0) + validated_data.get('shipping_fee', 0) - validated_data.get('discount', 0)
        return super().create(validated_data)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.get_full_name')

    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ('sender', 'timestamp')

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)
