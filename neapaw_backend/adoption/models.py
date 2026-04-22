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
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    
    # Living Address
    address_line1 = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    kyc_document = models.ImageField(upload_to='adoption/applications/kyc/', blank=True, null=True)
    user_photo = models.ImageField(upload_to='adoption/applications/photos/', blank=True, null=True)
    police_report = models.ImageField(upload_to='adoption/applications/police_reports/', blank=True, null=True)
    
    previously_owned_pets = models.BooleanField(default=False)
    previous_pet_details = models.TextField(blank=True, null=True)
    reason_for_adoption = models.TextField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Application for {self.pet.name} by {self.user.email}"


class AdoptionReview(models.Model):
    application = models.ForeignKey(AdoptionApplication, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='adoption_reviews')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['application', 'user'], name='unique_adoption_review_per_user_application')
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"Review for application {self.application_id} by {self.user}"


class AdoptionChatMessage(models.Model):
    application = models.ForeignKey(AdoptionApplication, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_admin_reply = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Chat for application {self.application_id} by {self.sender}"
