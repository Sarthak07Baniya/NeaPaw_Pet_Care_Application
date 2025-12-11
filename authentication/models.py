from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    contact_number = models.CharField(max_length=15, blank=True, null=True) 
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    dark_mode = models.BooleanField(default=False)
    notifications_enabled = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
    

# Create your models here.
