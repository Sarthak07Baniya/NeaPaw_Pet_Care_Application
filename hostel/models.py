from django.db import models
from django.conf import settings
from pets.models import Pet
from treatment.models import TreatmentType

class HostelRoom(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='hostel_rooms/', blank=True, null=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class HostelRoomFeature(models.Model):
    room = models.ForeignKey(HostelRoom, on_delete=models.CASCADE, related_name='features')
    text = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.room.name} - {self.text}"

class HostelBooking(models.Model):
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

    DIET_CHOICES = (
        ('carnivore', 'Carnivore'),
        ('half_carnivore', 'Half Carnivore'),
        ('vegetarian', 'Vegetarian'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='hostel_bookings')
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE)
    room = models.ForeignKey(HostelRoom, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPE_CHOICES)
    additional_treatments = models.ManyToManyField(TreatmentType, blank=True)
    
    # Health Info
    allergies = models.TextField(blank=True, null=True)
    health_conditions = models.TextField(blank=True, null=True)
    diet_type = models.CharField(max_length=20, choices=DIET_CHOICES)
    pet_nature = models.CharField(max_length=100)
    vaccination_status = models.CharField(max_length=100) # up_to_date, etc.
    communicable_disease = models.BooleanField(default=False)
    
    # KYC
    owner_photo = models.ImageField(upload_to='kyc/', blank=True, null=True)
    police_report = models.ImageField(upload_to='kyc/', blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Hostel for {self.pet.name} ({self.check_in_date} to {self.check_out_date})"
    
    def save(self, *args, **kwargs):
        """Validate dates and calculate price"""
        # Validate check-out is after check-in
        if self.check_out_date <= self.check_in_date:
            from django.core.exceptions import ValidationError
            raise ValidationError('Check-out date must be after check-in date')
        
        # Calculate total price if not set
        if not self.total_price or self.total_price == 0:
            self.total_price = self.calculate_price()
        
        super().save(*args, **kwargs)
    
    def calculate_price(self):
        """Calculate total price based on duration and treatments"""
        days = (self.check_out_date - self.check_in_date).days
        if days <= 0: return 0
        
        base_price = self.room.price_per_day if self.room else 500
        total = days * base_price
        
        # Add treatment costs
        for treatment in self.additional_treatments.all():
            total += treatment.base_price
        
        if self.service_type == 'pickup':
            total += 500 # Should ideally come from config or constants
        
        return total
    
    @property
    def duration_days(self):
        """Get booking duration in days"""
        return (self.check_out_date - self.check_in_date).days
