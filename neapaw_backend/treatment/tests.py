from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from pets.models import Pet
from treatment.models import TreatmentBooking, TreatmentType


User = get_user_model()


class TreatmentApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="treatment@example.com",
            email="treatment@example.com",
            password="testpassword123",
        )
        self.client.force_authenticate(user=self.user)
        self.pet = Pet.objects.create(user=self.user, name="Buddy", pet_type="Dog")
        self.treatment_type = TreatmentType.objects.create(
            name="Vaccination",
            description="General vaccination service",
            base_price="1000.00",
            duration_minutes=30,
            icon="syringe",
        )
        self.types_url = "/api/v1/treatment/types/"
        self.bookings_url = "/api/v1/treatment/bookings/"

    def test_list_treatment_types(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.types_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["name"], self.treatment_type.name)

    def test_create_treatment_booking(self):
        payload = {
            "pet": self.pet.id,
            "treatment_type": self.treatment_type.id,
            "service_type": "store_visit",
            "appointment_date": "2026-12-25",
            "appointment_time": "10:00:00",
            "payment_method": "cash_on_delivery",
        }

        response = self.client.post(self.bookings_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        booking = TreatmentBooking.objects.get(user=self.user)
        self.assertEqual(str(booking.price), "1000.00")
        self.assertIsNotNone(booking.order)
