from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'list', OrderViewSet, basename='order')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
