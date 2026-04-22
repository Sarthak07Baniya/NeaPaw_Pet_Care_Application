from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from adoption.models import AdoptionApplication, AdoptionPet


User = get_user_model()


class AdoptionApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="adoption@example.com",
            email="adoption@example.com",
            password="testpassword123",
            first_name="Adoption",
            last_name="User",
        )
        self.pet = AdoptionPet.objects.create(
            name="Miku",
            pet_type="Dog",
            breed="Home",
            age_months=2,
            gender="Female",
            weight=20,
            description="Good Girl",
            photo=SimpleUploadedFile("miku.jpg", b"filecontent", content_type="image/jpeg"),
            health_status="Healthy",
            temperament="Good",
            special_needs="None",
            is_available=True,
        )
        self.pets_url = "/api/v1/adoption/pets/"
        self.applications_url = "/api/v1/adoption/applications/"

    def test_list_and_filter_adoption_pets(self):
        response = self.client.get(self.pets_url, {"pet_type": "Dog"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["name"], self.pet.name)

    def test_create_and_list_adoption_applications(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            "pet": self.pet.id,
            "full_name": "Test User",
            "email": self.user.email,
            "phone": "9800000000",
            "address_line1": "Kathmandu Tower",
            "city": "Kathmandu",
            "state": "Bagmati",
            "postal_code": "44600",
            "previously_owned_pets": True,
            "previous_pet_details": "Owned a dog before for 3 years.",
            "reason_for_adoption": "Looking to adopt a friendly companion.",
        }

        create_response = self.client.post(self.applications_url, payload, format="json")
        list_response = self.client.get(self.applications_url)

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(AdoptionApplication.objects.filter(user=self.user).count(), 1)
        self.assertEqual(len(list_response.data["results"]), 1)
