from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from pets.models import Pet


User = get_user_model()


class PetsApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="pets@example.com",
            email="pets@example.com",
            password="testpassword123",
        )
        self.client.force_authenticate(user=self.user)
        self.list_url = "/api/v1/pets/"

    def test_create_pet(self):
        payload = {
            "name": "Buddy",
            "pet_type": "Dog",
            "breed": "Golden Retriever",
            "birthday": "2022-01-01",
            "gender": "Male",
            "weight": 25.5,
            "description": "A very friendly dog",
        }

        response = self.client.post(self.list_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], payload["name"])
        self.assertEqual(Pet.objects.filter(user=self.user).count(), 1)

    def test_list_only_user_pets(self):
        Pet.objects.create(user=self.user, name="Buddy", pet_type="Dog")
        other_user = User.objects.create_user(
            username="otherpets@example.com",
            email="otherpets@example.com",
            password="testpassword123",
        )
        Pet.objects.create(user=other_user, name="Milo", pet_type="Cat")

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["name"], "Buddy")
