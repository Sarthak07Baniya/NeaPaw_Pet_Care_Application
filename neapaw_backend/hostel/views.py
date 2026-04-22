from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from .models import HostelBooking, HostelRoom, HostelRoomFeature
from .serializers import HostelBookingSerializer, HostelRoomSerializer, HostelReviewSerializer

class HostelRoomViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HostelRoomSerializer
    permission_classes = [permissions.AllowAny]

    def _ensure_default_rooms(self):
        if HostelRoom.objects.filter(is_available=True).exists():
            return

        default_rooms = [
            {
                "name": "Cozy Kennel",
                "description": "A comfortable room for short stays and calm pets.",
                "price_per_day": 800,
                "features": ["Daily cleaning", "Fresh water", "Soft bedding"],
            },
            {
                "name": "Premium Suite",
                "description": "A spacious room with extra attention and play time.",
                "price_per_day": 1200,
                "features": ["Airy space", "Play session", "Photo updates"],
            },
            {
                "name": "Family Room",
                "description": "A larger room suited for pets that need more movement.",
                "price_per_day": 1500,
                "features": ["Large floor area", "Evening walk", "Comfort care"],
            },
        ]

        for room_data in default_rooms:
            room, created = HostelRoom.objects.get_or_create(
                name=room_data["name"],
                defaults={
                    "description": room_data["description"],
                    "price_per_day": room_data["price_per_day"],
                    "is_available": True,
                },
            )
            if created:
                for feature_text in room_data["features"]:
                    HostelRoomFeature.objects.create(room=room, text=feature_text)

    def get_queryset(self):
        self._ensure_default_rooms()
        return HostelRoom.objects.filter(is_available=True)

class HostelBookingViewSet(viewsets.ModelViewSet):
    serializer_class = HostelBookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

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

    @action(detail=True, methods=['get', 'post'])
    def review(self, request, pk=None):
        booking = self.get_object()

        if request.method == 'GET':
            serializer = HostelReviewSerializer(booking.reviews.all(), many=True)
            return Response(serializer.data)

        booking_status = str(booking.status or '').lower()
        order_status = str(getattr(booking.order, 'status', '') or '').lower()
        allowed_statuses = {'completed', 'check_out'}

        if booking_status not in allowed_statuses and order_status not in allowed_statuses:
            return Response(
                {'detail': 'Hostel can only be reviewed after check-out or completion.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = HostelReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(booking=booking, user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
