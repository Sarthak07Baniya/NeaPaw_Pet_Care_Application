from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdoptionPetViewSet, AdoptionApplicationViewSet

router = DefaultRouter()
router.register(r'pets', AdoptionPetViewSet)
router.register(r'applications', AdoptionApplicationViewSet, basename='adoption-application')

urlpatterns = [
    path('', include(router.urls)),
]
