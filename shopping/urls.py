from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CartViewSet, CouponViewSet, OfferViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'coupons', CouponViewSet)
router.register(r'offers', OfferViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('cart/', CartViewSet.as_view({'get': 'list'}), name='cart'),
    path('cart/items/', CartViewSet.as_view({'post': 'add_item'}), name='cart-add'),
    path('cart/update/', CartViewSet.as_view({'post': 'update_item'}), name='cart-update'),
    path('cart/remove/', CartViewSet.as_view({'post': 'remove_item'}), name='cart-remove'),
    path('cart/apply-coupon/', CouponViewSet.as_view({'post': 'apply'}), name='coupon-apply'),
]
