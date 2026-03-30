from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

class AppConfigView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        config = {
            "payment_methods": [
                {"id": "cod", "name": "Cash on Delivery", "icon": "dollar-sign"},
                {"id": "esewa", "name": "eSewa", "icon": "credit-card"},
            ],
            "hostel_service_types": [
                {
                    "id": "pickup",
                    "name": "Pick Up & Drop",
                    "description": "We pick up and drop your pet",
                    "icon": "truck",
                    "additionalFee": 500,
                },
                {
                    "id": "self",
                    "name": "Self Drop",
                    "description": "You drop and pick up your pet",
                    "icon": "user",
                    "additionalFee": 0,
                },
            ],
            "treatment_service_types": [
                {
                    "id": "pickup",
                    "name": "Pick Up",
                    "description": "We will pick up your pet from your location",
                    "icon": "truck",
                    "additionalFee": 200,
                },
                {
                    "id": "store",
                    "name": "Store Visit",
                    "description": "Bring your pet to our location",
                    "icon": "home",
                    "additionalFee": 0,
                },
            ],
            "support_contact": "+977-9800000000",
            "currency": "NPR",
            "currency_symbol": "Rs.",
        }
        return Response(config)
