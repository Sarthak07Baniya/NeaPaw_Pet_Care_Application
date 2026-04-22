from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from orders.models import Notification, Order
from profiles.models import ShippingAddress
from shopping.models import Cart, CartItem, Product


User = get_user_model()


class OrdersApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="orders@example.com",
            email="orders@example.com",
            password="testpassword123",
            first_name="Order",
            last_name="User",
        )
        self.product = Product.objects.create(
            name="Dog Belt",
            description="Comfortable pet belt",
            price="100.00",
            category="Belt",
            stock_quantity=5,
            in_stock=True,
        )
        self.cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=1)
        self.client.force_authenticate(user=self.user)

    def test_create_order_and_access_related_endpoints(self):
        payload = {
            "order_type": "shopping",
            "subtotal": "100.00",
            "discount": "0.00",
            "tax": "0.00",
            "shipping_fee": "0.00",
            "payment_method": "cash_on_delivery",
            "shipping_address": {
                "full_name": "Test User",
                "phone": "9800000000",
                "address_line1": "Kathmandu Tower",
                "city": "Kathmandu",
                "state": "Bagmati",
                "postal_code": "44600",
                "is_default": True,
            },
        }

        list_response = self.client.get("/api/v1/orders/list/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        create_response = self.client.post("/api/v1/orders/list/", payload, format="json")
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        order_id = create_response.data["id"]

        track_response = self.client.get(f"/api/v1/orders/list/{order_id}/track/")
        self.assertEqual(track_response.status_code, status.HTTP_200_OK)
        self.assertEqual(track_response.data["order_number"], create_response.data["order_number"])

        chat_post_response = self.client.post(
            f"/api/v1/orders/list/{order_id}/chat/",
            {"message": "Hello, I have a question about my order."},
            format="json",
        )
        self.assertEqual(chat_post_response.status_code, status.HTTP_201_CREATED)

        chat_list_response = self.client.get(f"/api/v1/orders/list/{order_id}/chat/")
        self.assertEqual(chat_list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(chat_list_response.data), 1)

        Notification.objects.create(
            user=self.user,
            title="Order update",
            message="Your order was placed.",
            notification_type="order_update",
        )
        notifications_response = self.client.get("/api/v1/orders/notifications/")
        self.assertEqual(notifications_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(notifications_response.data["results"]), 1)

        self.assertTrue(Order.objects.filter(user=self.user).exists())
        self.assertTrue(ShippingAddress.objects.filter(user=self.user).exists())
