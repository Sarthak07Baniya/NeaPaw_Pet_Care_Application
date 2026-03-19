from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import HostelBooking, HostelRoom
from .serializers import HostelBookingSerializer, HostelRoomSerializer

class HostelRoomViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HostelRoom.objects.filter(is_available=True)
    serializer_class = HostelRoomSerializer
    permission_classes = [permissions.AllowAny]

class HostelBookingViewSet(viewsets.ModelViewSet):
    serializer_class = HostelBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HostelBooking.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def availability(self, request):
        # Mock availability check
        return Response({
            'available': True,
            'price_per_day': 500,
            'available_rooms': 5
        })
