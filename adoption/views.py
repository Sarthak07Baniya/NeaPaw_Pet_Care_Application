from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from .models import AdoptionPet, AdoptionApplication
from .serializers import (
    AdoptionPetSerializer,
    AdoptionApplicationSerializer,
    AdoptionReviewSerializer,
    AdoptionChatMessageSerializer,
)
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
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return AdoptionApplication.objects.filter(user=self.request.user)

    @action(detail=True, methods=['get', 'post'])
    def review(self, request, pk=None):
        application = self.get_object()

        if request.method == 'GET':
            serializer = AdoptionReviewSerializer(application.reviews.all(), many=True)
            return Response(serializer.data)

        if application.status not in ['approved', 'rejected']:
            return Response(
                {'detail': 'Application can only be reviewed after it is approved or rejected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AdoptionReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(application=application, user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'])
    def chat(self, request, pk=None):
        application = self.get_object()

        if request.method == 'GET':
            serializer = AdoptionChatMessageSerializer(
                application.chat_messages.all(),
                many=True,
                context={'request': request},
            )
            return Response(serializer.data)

        serializer = AdoptionChatMessageSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(application=application, sender=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
