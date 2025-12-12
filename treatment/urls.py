from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TreatmentTypeViewSet, TreatmentBookingViewSet

router = DefaultRouter()
router.register(r'types', TreatmentTypeViewSet)
router.register(r'bookings', TreatmentBookingViewSet, basename='treatment-booking')

urlpatterns = [
    path('', include(router.urls)),
]
