from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import TreatmentType, TreatmentBooking
from .serializers import TreatmentTypeSerializer, TreatmentBookingSerializer, TreatmentReviewSerializer

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

    @action(detail=True, methods=['get', 'post'])
    def review(self, request, pk=None):
        booking = self.get_object()
        order_status = getattr(booking.order, 'status', None)

        if request.method == 'GET':
            serializer = TreatmentReviewSerializer(booking.reviews.all(), many=True)
            return Response(serializer.data)

        if booking.status != 'completed' and order_status != 'completed':
            return Response(
                {'detail': 'Treatment can only be reviewed after it is completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TreatmentReviewSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(booking=booking, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
