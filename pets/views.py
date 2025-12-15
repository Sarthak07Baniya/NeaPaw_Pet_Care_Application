from rest_framework import viewsets, permissions
from .models import Pet
from .serializers import PetSerializer
from rest_framework import filters

class PetViewSet(viewsets.ModelViewSet):
    serializer_class = PetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 1. Fix for Swagger/Schema generation
        # This prevents the 'AnonymousUser' to 'int' cast error
        if getattr(self, 'swagger_fake_view', False):
            return Pet.objects.none()
        # 2. Real-world logic
        # Only return pets belonging to the logged-in user
        return Pet.objects.filter(user=self.request.user)

