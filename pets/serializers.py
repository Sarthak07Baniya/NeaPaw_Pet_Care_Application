from rest_framework import serializers
from .models import Pet
from datetime import date


class PetSerializer(serializers.ModelSerializer):
    age_years = serializers.SerializerMethodField()

    class Meta:
        model = Pet
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

    def get_age_years(self, obj):
        """Calculate pet's age in years based on birthday."""
        if obj.birthday:
            today = date.today()
            age = today.year - obj.birthday.year - ((today.month, today.day) < (obj.birthday.month, obj.birthday.day))
            return age
        return None
    
    def validate_weight(self, value):
        """Ensure and validate weight is a positive number."""
        if value is not None and value <=0:
            raise serializers.ValidationError("Weight must be a positive number.")
        if value is not None and value > 500:
            raise serializers.ValidationError("Weight seems unreasonably high. Please check the value.")
        return value
    
    def validate_birthday(self, value):
        """Validate birthday is not in the future."""
        if value and value > date.today():
            raise serializers.ValidationError("Birthday cannot be in the future.")
        return value
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
        