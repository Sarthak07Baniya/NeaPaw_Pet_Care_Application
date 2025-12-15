from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import TreatmentType, TreatmentBooking
from .serializers import TreatmentTypeSerializer, TreatmentBookingSerializer

class TreatmentTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TreatmentType.objects.all()
    serializer_class = TreatmentTypeSerializer
    permission_classes = [permissions.AllowAny]

class TreatmentBookingViewSet(viewsets.ModelViewSet):
    serializer_class = TreatmentBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TreatmentBooking.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'pending':
            booking.status = 'cancelled'
            booking.save()
            return Response({'status': 'booking cancelled'})
        return Response({'error': 'Cannot cancel booking'}, status=status.HTTP_400_BAD_REQUEST)
