from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from hostel.models import HostelBooking, HostelRoom
from pets.models import Pet


User = get_user_model()


class HostelApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="hostel@example.com",
            email="hostel@example.com",
            password="testpassword123",
        )
        self.pet = Pet.objects.create(user=self.user, name="Buddy", pet_type="Dog")
        self.room = HostelRoom.objects.create(
            name="Cozy Kennel",
            description="A comfortable room for short stays.",
            price_per_day="800.00",
            is_available=True,
        )
        self.rooms_url = "/api/v1/hostel/rooms/"
        self.bookings_url = "/api/v1/hostel/bookings/"

    def test_list_hostel_rooms(self):
        response = self.client.get(self.rooms_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["name"], self.room.name)

    def test_create_and_list_hostel_bookings(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            "pet": self.pet.id,
            "room": self.room.id,
            "check_in_date": "2026-01-10",
            "check_out_date": "2026-01-12",
            "service_type": "store_visit",
            "diet_type": "carnivore",
            "pet_nature": "Friendly",
            "vaccination_status": "up_to_date",
            "communicable_disease": False,
            "allergies": "",
            "health_conditions": "",
        }

        create_response = self.client.post(self.bookings_url, payload, format="multipart")
        list_response = self.client.get(self.bookings_url)

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        booking = HostelBooking.objects.get(user=self.user)
        self.assertEqual(booking.room, self.room)
        self.assertEqual(len(list_response.data["results"]), 1)
