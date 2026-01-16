from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HostelBookingViewSet, HostelRoomViewSet

router = DefaultRouter()
router.register(r'bookings', HostelBookingViewSet, basename='hostel-booking')
router.register(r'rooms', HostelRoomViewSet, basename='hostel-room')

urlpatterns = [
    path('', include(router.urls)),
]
