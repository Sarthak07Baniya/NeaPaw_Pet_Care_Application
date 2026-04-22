from rest_framework import serializers
from .models import HostelBooking, HostelRoom, HostelRoomFeature, HostelReview
from pets.serializers import PetSerializer
from treatment.serializers import TreatmentTypeSerializer
from treatment.models import TreatmentType
from profiles.models import ShippingAddress


LEGACY_ADDITIONAL_TREATMENTS = {
    'premium bath': {
        'description': 'Additional premium bath service for hostel bookings.',
        'base_price': 500,
        'duration_minutes': 30,
        'icon': 'scissors',
    },
    'tick treatment': {
        'description': 'Additional tick treatment service for hostel bookings.',
        'base_price': 800,
        'duration_minutes': 45,
        'icon': 'shield',
    },
    'nail clipping': {
        'description': 'Additional nail clipping service for hostel bookings.',
        'base_price': 200,
        'duration_minutes': 20,
        'icon': 'scissors',
    },
}

class HostelRoomFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = HostelRoomFeature
        fields = ('id', 'text')

class HostelRoomSerializer(serializers.ModelSerializer):
    features = HostelRoomFeatureSerializer(many=True, read_only=True)
    
    class Meta:
        model = HostelRoom
        fields = '__all__'

class HostelBookingSerializer(serializers.ModelSerializer):
    pet_details = PetSerializer(source='pet', read_only=True)
    room_details = HostelRoomSerializer(source='room', read_only=True)
    additional_treatments_details = TreatmentTypeSerializer(source='additional_treatments', many=True, read_only=True)
    order_number = serializers.SerializerMethodField()

    class Meta:
        model = HostelBooking
        fields = '__all__'
        read_only_fields = ('user', 'total_price', 'status', 'created_at', 'updated_at')

    def get_order_number(self, obj):
        return obj.order.order_number if obj.order else None

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        request = self.context.get('request')
        payment_method = str(request.data.get('payment_method') or '').strip().lower() if request is not None else ''
        room = validated_data.get('room')
        days = (validated_data['check_out_date'] - validated_data['check_in_date']).days
        
        base_price_per_day = room.price_per_day if room else 500
        base_price = max(1, days) * base_price_per_day
        
        treatments = list(validated_data.pop('additional_treatments', []))

        if request is not None:
            if hasattr(request.data, 'getlist'):
                raw_labels = request.data.getlist('additional_treatment_labels')
            else:
                raw_labels = request.data.get('additional_treatment_labels', [])
                if isinstance(raw_labels, str):
                    raw_labels = [raw_labels]
            for raw_label in raw_labels:
                normalized_label = str(raw_label or '').strip()
                if not normalized_label:
                    continue

                legacy_defaults = LEGACY_ADDITIONAL_TREATMENTS.get(
                    normalized_label.lower(),
                    {
                        'description': f'{normalized_label} service selected during hostel checkout.',
                        'base_price': 0,
                        'duration_minutes': 30,
                        'icon': 'activity',
                    },
                )
                treatment, _ = TreatmentType.objects.get_or_create(
                    name=normalized_label,
                    defaults=legacy_defaults,
                )
                if all(existing.pk != treatment.pk for existing in treatments):
                    treatments.append(treatment)

        treatment_price = sum(t.base_price for t in treatments)
        
        validated_data['total_price'] = base_price + treatment_price
        if payment_method == 'cod':
            validated_data['status'] = 'confirmed'
        booking = super().create(validated_data)
        booking.refresh_from_db()
        if treatments:
            booking.additional_treatments.set(treatments)

        if request is not None and booking.order_id:
            order = booking.order
            full_name = str(request.data.get('full_name') or request.data.get('name') or '').strip()
            phone = str(request.data.get('phone') or '').strip()
            email = str(request.data.get('email') or '').strip()
            address = str(request.data.get('address_line1') or request.data.get('address') or '').strip()

            if any([full_name, phone, email, address]):
                shipping_address = ShippingAddress.objects.create(
                    user=validated_data['user'],
                    full_name=full_name or validated_data['user'].get_full_name() or validated_data['user'].email,
                    phone=phone,
                    email=email,
                    address_line1=address,
                    city='',
                    state='',
                    postal_code='',
                    country='',
                )
                order.shipping_address = shipping_address
                order.payment_method = request.data.get('payment_method') or order.payment_method
                order.save(update_fields=['shipping_address', 'payment_method', 'updated_at'])
        return booking


class HostelReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')

    class Meta:
        model = HostelReview
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
