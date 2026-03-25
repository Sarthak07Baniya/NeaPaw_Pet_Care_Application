from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DevicePushTokenViewSet, PetVaccineViewSet, PetViewSet

router = DefaultRouter()
router.register(r'vaccines', PetVaccineViewSet, basename='pet-vaccine')
router.register(r'device-tokens', DevicePushTokenViewSet, basename='device-push-token')
router.register(r'', PetViewSet, basename='pet')

urlpatterns = [
    path('', include(router.urls)),
]
