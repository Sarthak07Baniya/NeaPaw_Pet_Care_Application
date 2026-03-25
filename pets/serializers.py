from rest_framework import serializers
from .models import DevicePushToken, Pet, PetVaccine
from datetime import date

class PetSerializer(serializers.ModelSerializer):
    age_years = serializers.SerializerMethodField()
    
    class Meta:
        model = Pet
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

    def get_age_years(self, obj):
        """Calculate pet age in years"""
        if obj.birthday:
            today = date.today()
            age = today.year - obj.birthday.year - ((today.month, today.day) < (obj.birthday.month, obj.birthday.day))
            return age
        return None
    
    def validate_weight(self, value):
        """Validate weight is positive"""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Weight must be a positive number")
        if value is not None and value > 500:
            raise serializers.ValidationError("Weight seems unreasonably high. Please check.")
        return value
    
    def validate_birthday(self, value):
        """Validate birthday is not in future"""
        if value and value > date.today():
            raise serializers.ValidationError("Birthday cannot be in the future")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class PetVaccineSerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(source='scheduled_at')

    class Meta:
        model = PetVaccine
        fields = (
            'id',
            'pet',
            'name',
            'date',
            'note',
            'reminder_sent_at',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('reminder_sent_at', 'created_at', 'updated_at')

    def validate_pet(self, value):
        request = self.context.get('request')
        if request and value.user_id != request.user.id:
            raise serializers.ValidationError("You can only add vaccines for your own pets.")
        return value


class DevicePushTokenSerializer(serializers.ModelSerializer):
    token = serializers.CharField(validators=[])

    class Meta:
        model = DevicePushToken
        fields = (
            'id',
            'token',
            'platform',
            'device_name',
            'is_active',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        user = self.context['request'].user
        token_value = validated_data['token']
        defaults = {
            'user': user,
            'platform': validated_data['platform'],
            'device_name': validated_data.get('device_name'),
            'is_active': validated_data.get('is_active', True),
        }
        token, _ = DevicePushToken.objects.update_or_create(
            token=token_value,
            defaults=defaults,
        )
        return token
