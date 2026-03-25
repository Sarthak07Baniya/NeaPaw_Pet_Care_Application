from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DevicePushToken, Pet, PetVaccine
from .serializers import DevicePushTokenSerializer, PetSerializer, PetVaccineSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_yasg.utils import swagger_auto_schema

class PetViewSet(viewsets.ModelViewSet):
    serializer_class = PetSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    @swagger_auto_schema(security=[{'Bearer': []}])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(security=[{'Bearer': []}])
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        return Pet.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PetVaccineViewSet(viewsets.ModelViewSet):
    serializer_class = PetVaccineSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        queryset = PetVaccine.objects.filter(user=self.request.user).select_related('pet')
        pet_id = self.request.query_params.get('pet')
        if pet_id:
            queryset = queryset.filter(pet_id=pet_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='mark-reminder-sent')
    def mark_reminder_sent(self, request, pk=None):
        vaccine = self.get_object()
        if vaccine.reminder_sent_at is None:
            vaccine.reminder_sent_at = timezone.now()
            vaccine.save()
        serializer = self.get_serializer(vaccine)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DevicePushTokenViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = DevicePushTokenSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        return DevicePushToken.objects.filter(user=self.request.user)
