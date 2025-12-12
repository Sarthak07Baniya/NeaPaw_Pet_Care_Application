from rest_framework import viewsets, permissions
from .models import ShippingAddress, SavedCard
from .serializers import ShippingAddressSerializer, SavedCardSerializer


class ShippingAddressViewSet(viewsets.ModelViewSet):
    serializer_class = ShippingAddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ShippingAddress.objects.filter(user=self.request.user)
    
class SavedCardViewSet(viewsets.ModelViewSet):
    serializer_class = SavedCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedCard.objects.filter(user=self.request.user)
    
    



