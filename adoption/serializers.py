from rest_framework import serializers
from django.db.models import Avg
from .models import AdoptionPet, AdoptionApplication, AdoptionReview, AdoptionChatMessage

class AdoptionPetSerializer(serializers.ModelSerializer):
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    class Meta:
        model = AdoptionPet
        fields = '__all__'

    def get_rating(self, obj):
        average = AdoptionReview.objects.filter(application__pet=obj).aggregate(avg=Avg('rating'))['avg']
        return round(float(average), 1) if average is not None else 0

    def get_reviews_count(self, obj):
        return AdoptionReview.objects.filter(application__pet=obj).count()

class AdoptionApplicationSerializer(serializers.ModelSerializer):
    pet_details = AdoptionPetSerializer(source='pet', read_only=True)

    class Meta:
        model = AdoptionApplication
        fields = '__all__'
        read_only_fields = ('user', 'status', 'submitted_at', 'reviewed_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AdoptionReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')

    class Meta:
        model = AdoptionReview
        fields = ('id', 'application', 'user', 'user_name', 'rating', 'comment', 'created_at')
        read_only_fields = ('application', 'user', 'created_at')

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def validate_comment(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Review comment must be at least 10 characters long.')
        return value.strip()


class AdoptionChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.get_full_name')

    class Meta:
        model = AdoptionChatMessage
        fields = ('id', 'application', 'sender', 'sender_name', 'message', 'timestamp', 'is_admin_reply')
        read_only_fields = ('application', 'sender', 'timestamp', 'is_admin_reply')

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['sender'] = request.user
        return super().create(validated_data)
