from rest_framework import serializers
from .models import TreatmentType, TreatmentBooking, TreatmentReview
from pets.serializers import PetSerializer
from profiles.models import ShippingAddress

class TreatmentTypeSerializer(serializers.ModelSerializer):
    #all models and fields should be exposed to API response
    class Meta: #container class for settings
        model = TreatmentType
        fields = '__all__'

class TreatmentBookingSerializer(serializers.ModelSerializer):
    treatment_type_details = TreatmentTypeSerializer(source='treatment_type', read_only=True)
    pet_details = PetSerializer(source='pet', read_only=True)
    order_number = serializers.SerializerMethodField()
    customer_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    customer_phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    customer_email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    customer_address = serializers.CharField(write_only=True, required=False, allow_blank=True)
    payment_method = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = TreatmentBooking
        fields = '__all__'
        read_only_fields = ('user', 'price', 'status', 'created_at', 'updated_at')

    def get_order_number(self, obj):
        return obj.order.order_number if obj.order else None

    def create(self, validated_data):
        customer_name = (validated_data.pop('customer_name', '') or '').strip()
        customer_phone = (validated_data.pop('customer_phone', '') or '').strip()
        customer_email = (validated_data.pop('customer_email', '') or '').strip()
        customer_address = (validated_data.pop('customer_address', '') or '').strip()
        payment_method = (validated_data.pop('payment_method', '') or '').strip()
        existing_notes = (validated_data.get('notes') or '').strip()

        validated_data['user'] = self.context['request'].user
        validated_data['price'] = validated_data['treatment_type'].base_price
        validated_data['notes'] = '\n'.join(
            note for note in [existing_notes, f'Payment: {payment_method}' if payment_method else ''] if note
        )

        booking = super().create(validated_data)

        if booking.order_id:
            shipping_address = None
            if customer_name or customer_phone or customer_email or customer_address:
                shipping_address = ShippingAddress.objects.create(
                    user=validated_data['user'],
                    full_name=customer_name or validated_data['user'].get_full_name() or validated_data['user'].email,
                    phone=customer_phone,
                    email=customer_email or None,
                    address_line1=customer_address or '-',
                    address_line2='',
                    city='',
                    state='',
                    postal_code='',
                    country='Nepal',
                )

            order = booking.order
            updated_fields = []
            if payment_method and order.payment_method != payment_method:
                order.payment_method = payment_method
                updated_fields.append('payment_method')
            if shipping_address and order.shipping_address_id != shipping_address.id:
                order.shipping_address = shipping_address
                updated_fields.append('shipping_address')
            if updated_fields:
                updated_fields.append('updated_at')
                order.save(update_fields=updated_fields)

        return booking


class TreatmentReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')

    class Meta:
        model = TreatmentReview
        fields = ('id', 'booking', 'user', 'user_name', 'rating', 'comment', 'created_at')
        read_only_fields = ('booking', 'user', 'created_at')

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def validate_comment(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Review comment must be at least 10 characters long.')
        return value.strip()
