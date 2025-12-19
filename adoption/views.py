from rest_framework import viewsets, permissions
from .models import AdoptionPet, AdoptionApplication
from .serializers import AdoptionPetSerializer, AdoptionApplicationSerializer
from django_filters.rest_framework import DjangoFilterBackend

class AdoptionPetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AdoptionPet.objects.filter(is_available=True)
    serializer_class = AdoptionPetSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['pet_type']

class AdoptionApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = AdoptionApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AdoptionApplication.objects.filter(user=self.request.user)
