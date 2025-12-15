import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neapaw_api.settings')
django.setup()


from treatment.models import TreatmentType


def populate():
    print("Populating data...")


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

   

populate()
