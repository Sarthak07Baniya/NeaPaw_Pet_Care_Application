from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EsewaCheckoutView,
    EsewaFailureRedirectView,
    EsewaSuccessRedirectView,
    NotificationViewSet,
    OrderViewSet,
)

router = DefaultRouter()
router.register(r'list', OrderViewSet, basename='order')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('esewa/checkout/', EsewaCheckoutView.as_view(), name='orders-esewa-checkout'),
    path('esewa/success/', EsewaSuccessRedirectView.as_view(), name='orders-esewa-success'),
    path('esewa/failure/', EsewaFailureRedirectView.as_view(), name='orders-esewa-failure'),
    path('', include(router.urls)),
]
