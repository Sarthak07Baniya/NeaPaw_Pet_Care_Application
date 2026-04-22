from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from shopping.models import Cart, CartItem, Coupon, Offer, Product


User = get_user_model()


class ShoppingApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="shopping@example.com",
            email="shopping@example.com",
            password="testpassword123",
        )
        self.product = Product.objects.create(
            name="Dog Food",
            description="Healthy dog food pack",
            price="500.00",
            category="Food",
            stock_quantity=10,
            in_stock=True,
        )
        self.offer = Offer.objects.create(
            title="Summer Offer",
            description="Discount on shopping items",
            discount_text="10% OFF",
            category="Shopping",
            valid_until=timezone.localdate() + timedelta(days=10),
            is_active=True,
        )
        self.coupon = Coupon.objects.create(
            code="NEWYEAR50",
            discount="50.00",
            discount_type="fixed",
            description="Flat discount coupon",
            min_order="0.00",
            valid_until=timezone.localdate() + timedelta(days=10),
            is_active=True,
        )

    def test_list_products_and_offers(self):
        self.client.force_authenticate(user=self.user)
        products_response = self.client.get("/api/v1/shopping/products/")
        offers_response = self.client.get("/api/v1/shopping/offers/")

        self.assertEqual(products_response.status_code, status.HTTP_200_OK)
        self.assertEqual(offers_response.status_code, status.HTTP_200_OK)
        self.assertEqual(products_response.data["results"][0]["name"], self.product.name)
        self.assertEqual(offers_response.data["results"][0]["title"], self.offer.title)

    def test_cart_add_update_apply_coupon_and_remove_item(self):
        self.client.force_authenticate(user=self.user)

        cart_response = self.client.get("/api/v1/shopping/cart/")
        self.assertEqual(cart_response.status_code, status.HTTP_200_OK)

        add_response = self.client.post(
            "/api/v1/shopping/cart/items/",
            {"product_id": self.product.id, "quantity": 1},
            format="json",
        )
        self.assertEqual(add_response.status_code, status.HTTP_200_OK)
        item_id = add_response.data["items"][0]["id"]

        update_response = self.client.post(
            "/api/v1/shopping/cart/update/",
            {"item_id": item_id, "quantity": 2},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["items"][0]["quantity"], 2)

        coupon_response = self.client.post(
            "/api/v1/shopping/cart/apply-coupon/",
            {"code": self.coupon.code},
            format="json",
        )
        self.assertEqual(coupon_response.status_code, status.HTTP_200_OK)
        self.assertEqual(coupon_response.data["code"], self.coupon.code)

        remove_response = self.client.post(
            "/api/v1/shopping/cart/remove/",
            {"item_id": item_id},
            format="json",
        )
        self.assertEqual(remove_response.status_code, status.HTTP_200_OK)
        self.assertEqual(remove_response.data["items"], [])

        cart = Cart.objects.get(user=self.user)
        self.assertFalse(CartItem.objects.filter(cart=cart).exists())
