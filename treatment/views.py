from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import TreatmentType, TreatmentBooking
from .serializers import TreatmentTypeSerializer, TreatmentBookingSerializer

class TreatmentTypeViewSet(viewsets.ReadOnlyModelViewSet): #Only get request
    queryset = TreatmentType.objects.all() 
    serializer_class = TreatmentTypeSerializer
    permission_classes = [permissions.AllowAny] #anyone can access even not logged in

class TreatmentBookingViewSet(viewsets.ModelViewSet): #CRUD
    serializer_class = TreatmentBookingSerializer
    permission_classes = [permissions.IsAuthenticated] #only authenticated person can book

    def get_queryset(self):
        return TreatmentBooking.objects.filter(user=self.request.user) #ensures only a user sees their own booking

    @action(detail=True, methods=['post']) #booking cancle action #details=ture applies to the single booking
    def cancel(self, request, pk=None): #argument has default value
        booking = self.get_object()
        if booking.status == 'pending':
            booking.status = 'cancelled'
            booking.save()
            return Response({'status': 'booking cancelled'})
        return Response({'error': 'Cannot cancel booking'}, status=status.HTTP_400_BAD_REQUEST)
