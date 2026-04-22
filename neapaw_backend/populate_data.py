import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neawpaw_api.settings')
django.setup()


from shopping.models import Product, Offer, Coupon
from treatment.models import TreatmentType
from adoption.models import AdoptionPet

def populate():
    print("Populating data...")

    # Products
    if not Product.objects.exists():
        Product.objects.create(
            name="Premium Dog Food",
            description="High quality food for dogs",
            price=1299.00,
            category="Food",
            stock_quantity=100
        )
        Product.objects.create(
            name="Cat Toy",
            description="Interactive toy for cats",
            price=599.00,
            category="Toys",
            stock_quantity=50
        )
        print("Created Products")

    # Offers
    if not Offer.objects.exists():
        Offer.objects.create(
            title="Summer Sale",
            description="Get 50% off on all grooming",
            discount_text="50% OFF",
            category="Treatment",
            valid_until=date.today() + timedelta(days=30)
        )
        print("Created Offers")

    # Treatment Types
    if not TreatmentType.objects.exists():
        TreatmentType.objects.create(
            name="Grooming",
            description="Full body grooming",
            base_price=1500.00,
            duration_minutes=60,
            icon="cut"
        )
        print("Created Treatment Types")

    # Adoption Pets
    if not AdoptionPet.objects.exists():
        AdoptionPet.objects.create(
            name="Buddy",
            pet_type="Dog",
            breed="Golden Retriever",
            age_months=24,
            gender="Male",
            weight=25.0,
            description="Friendly and energetic",
            is_available=True
        )
        print("Created Adoption Pets")

populate()
