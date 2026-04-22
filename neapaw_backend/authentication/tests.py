from django.contrib.auth import get_user_model
from django.core import mail
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from authentication.models import JWTTokenHistory


User = get_user_model()


class AuthenticationApiTests(APITestCase):
    def setUp(self):
        self.register_url = "/api/v1/auth/register/"
        self.login_url = "/api/v1/auth/login/"
        self.profile_url = "/api/v1/auth/profile/"
        self.change_password_url = "/api/v1/auth/change-password/"
        self.password_reset_url = "/api/v1/auth/password-reset/"
        self.password_reset_confirm_url = "/api/v1/auth/password-reset-confirm/"
        self.user = User.objects.create_user(
            username="existing@example.com",
            email="existing@example.com",
            password="testpassword123",
            first_name="Existing",
            last_name="User",
            contact_number="9800000000",
        )

    def test_register_user_returns_tokens(self):
        payload = {
            "email": "newuser@example.com",
            "password": "testpassword123",
            "full_name": "New User",
            "contact_number": "9741729705",
        }

        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["user"]["email"], payload["email"])
        self.assertIn("tokens", response.data)
        self.assertEqual(JWTTokenHistory.objects.filter(user__email=payload["email"]).count(), 0)

    def test_login_user_returns_tokens(self):
        response = self.client.post(
            self.login_url,
            {"email": "existing@example.com", "password": "testpassword123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", response.data)
        self.assertEqual(JWTTokenHistory.objects.filter(user=self.user, source="login").count(), 1)

    def test_get_profile_for_authenticated_user(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)

    def test_change_password_updates_password_for_authenticated_user(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.change_password_url,
            {
                "old_password": "testpassword123",
                "new_password": "updatedpassword123",
                "confirm_password": "updatedpassword123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("updatedpassword123"))

    def test_change_password_rejects_incorrect_old_password(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.change_password_url,
            {
                "old_password": "wrongpassword123",
                "new_password": "updatedpassword123",
                "confirm_password": "updatedpassword123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Old password is incorrect.")

    def test_password_reset_request_accepts_existing_email(self):
        response = self.client.post(
            self.password_reset_url,
            {"email": self.user.email},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user.email)
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.password_reset_otp)
        self.assertEqual(len(self.user.password_reset_otp), 6)
        self.assertEqual(len(mail.outbox), 1)

    def test_password_reset_confirm_updates_password(self):
        self.user.issue_password_reset_otp()
        otp = self.user.password_reset_otp

        response = self.client.post(
            self.password_reset_confirm_url,
            {
                "email": self.user.email,
                "otp": otp,
                "new_password": "newpassword123",
                "confirm_password": "newpassword123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpassword123"))
        self.assertIsNone(self.user.password_reset_otp)

    def test_password_reset_confirm_rejects_invalid_otp(self):
        self.user.issue_password_reset_otp()

        response = self.client.post(
            self.password_reset_confirm_url,
            {
                "email": self.user.email,
                "otp": "000000",
                "new_password": "newpassword123",
                "confirm_password": "newpassword123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Invalid OTP.")

    def test_password_reset_confirm_rejects_expired_otp(self):
        self.user.issue_password_reset_otp()
        self.user.password_reset_otp_expires_at = timezone.now() - timezone.timedelta(minutes=1)
        self.user.save(update_fields=["password_reset_otp_expires_at"])

        response = self.client.post(
            self.password_reset_confirm_url,
            {
                "email": self.user.email,
                "otp": self.user.password_reset_otp,
                "new_password": "newpassword123",
                "confirm_password": "newpassword123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "OTP has expired. Please request a new OTP.")
