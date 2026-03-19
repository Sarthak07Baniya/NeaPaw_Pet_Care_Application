from rest_framework import serializers
from .models import HostelBooking, HostelRoom, HostelRoomFeature
from pets.serializers import PetSerializer
from treatment.serializers import TreatmentTypeSerializer

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

    class Meta:
        model = HostelBooking
        fields = '__all__'
        read_only_fields = ('user', 'total_price', 'status', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        room = validated_data.get('room')
        days = (validated_data['check_out_date'] - validated_data['check_in_date']).days
        
        base_price_per_day = room.price_per_day if room else 500
        base_price = max(1, days) * base_price_per_day
        
        treatments = validated_data.get('additional_treatments', [])
        treatment_price = sum(t.base_price for t in treatments)
        
        validated_data['total_price'] = base_price + treatment_price
        return super().create(validated_data)
