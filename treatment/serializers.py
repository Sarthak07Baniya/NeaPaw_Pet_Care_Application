from rest_framework import serializers
from .models import TreatmentType, TreatmentBooking
from pets.serializers import PetSerializer

class TreatmentTypeSerializer(serializers.ModelSerializer):
    #all models and fields should be exposed to API response
    class Meta: #container class for settings
        model = TreatmentType
        fields = '__all__'

class TreatmentBookingSerializer(serializers.ModelSerializer):
    treatment_type_details = TreatmentTypeSerializer(source='treatment_type', read_only=True)
    pet_details = PetSerializer(source='pet', read_only=True)

    class Meta:
        model = TreatmentBooking
        fields = '__all__'
        read_only_fields = ('user', 'price', 'status', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['price'] = validated_data['treatment_type'].base_price
        return super().create(validated_data)
