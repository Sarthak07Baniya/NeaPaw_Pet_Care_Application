from django.urls import path, include
from rest_framework.routers import DefaultRouters
from .views import TreatmentBookingViewSet, TreatmentTypeViewSet

router = DefaultRouters()
router.register(r'types', TreatmentTypeViewSet)
router.register(r'bookings',TreatmentBookingViewSet, basename= 'treatment-booking')

urlpatterns = [

    path('', include (router.urls)),
]