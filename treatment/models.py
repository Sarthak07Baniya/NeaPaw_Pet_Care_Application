from django.db import models
from django.conf import settings
from pets.models import Pet

class TreatmentType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.IntegerField()
    icon = models.CharField(max_length=50, help_text="Icon name from frontend library")
    
    def __str__(self):
        return self.name

class TreatmentBooking(models.Model):
    SERVICE_TYPE_CHOICES = (
        ('pickup', 'Pick Up'),
        ('store_visit', 'Store Visit'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='treatment_bookings')
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE)
    treatment_type = models.ForeignKey(TreatmentType, on_delete=models.CASCADE)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPE_CHOICES)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.treatment_type.name} for {self.pet.name}"
    
    def save(self, *args, **kwargs):
        """Set price from treatment type if not specified"""
        if not self.price or self.price == 0:
            self.price = self.treatment_type.base_price
        super().save(*args, **kwargs) #positional arguments, keyword arguments
