from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShippingAddressViewSet, SavedCardViewSet

router = DefaultRouter()
router.register(r'addresses', ShippingAddressViewSet, basename='shipping-address')
router.register(r'cards', SavedCardViewSet, basename='saved-card')

urlpatterns = [
    path('', include(router.urls)),
]
