from rest_framework import serializers
from .models import AdoptionPet, AdoptionApplication

class AdoptionPetSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdoptionPet
        fields = '__all__'

class AdoptionApplicationSerializer(serializers.ModelSerializer):
    pet_details = AdoptionPetSerializer(source='pet', read_only=True)

    class Meta:
        model = AdoptionApplication
        fields = '__all__'
        read_only_fields = ('user', 'status', 'submitted_at', 'reviewed_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
