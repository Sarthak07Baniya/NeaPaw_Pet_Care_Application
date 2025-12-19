from django.db import models
from django.conf import settings

class AdoptionPet(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
    )
    
    name = models.CharField(max_length=100)
    pet_type = models.CharField(max_length=50)
    breed = models.CharField(max_length=100, blank=True, null=True)
    age_months = models.IntegerField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    weight = models.FloatField()
    description = models.TextField()
    photo = models.ImageField(upload_to='adoption/')
    health_status = models.TextField(blank=True, null=True)
    temperament = models.CharField(max_length=200, blank=True, null=True)
    special_needs = models.TextField(blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.pet_type})"

class AdoptionApplication(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='adoption_applications')
    pet = models.ForeignKey(AdoptionPet, on_delete=models.CASCADE)
    
    # Living Address
    address_line1 = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    
    previously_owned_pets = models.BooleanField(default=False)
    previous_pet_details = models.TextField(blank=True, null=True)
    reason_for_adoption = models.TextField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Application for {self.pet.name} by {self.user.email}"
