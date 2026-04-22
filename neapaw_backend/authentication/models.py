from datetime import datetime, timezone as dt_timezone

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import random

class User(AbstractUser):
    email = models.EmailField(unique=True)
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    dark_mode = models.BooleanField(default=False)
    notifications_enabled = models.BooleanField(default=True)
    password_reset_otp = models.CharField(max_length=6, blank=True, null=True)
    password_reset_otp_expires_at = models.DateTimeField(blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    def issue_password_reset_otp(self, validity_minutes=10):
        self.password_reset_otp = f"{random.randint(0, 999999):06d}"
        self.password_reset_otp_expires_at = timezone.now() + timezone.timedelta(minutes=validity_minutes)
        self.save(update_fields=['password_reset_otp', 'password_reset_otp_expires_at'])
        return self.password_reset_otp

    def clear_password_reset_otp(self):
        self.password_reset_otp = None
        self.password_reset_otp_expires_at = None
        self.save(update_fields=['password_reset_otp', 'password_reset_otp_expires_at'])


class JWTTokenHistory(models.Model):
    SOURCE_CHOICES = (
        ("register", "Register"),
        ("login", "Login"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="jwt_token_history",
    )
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    access_token = models.TextField()
    refresh_token = models.TextField()
    access_token_jti = models.CharField(max_length=255, blank=True)
    refresh_token_jti = models.CharField(max_length=255, blank=True)
    access_expires_at = models.DateTimeField(blank=True, null=True)
    refresh_expires_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "JWT token history"
        verbose_name_plural = "JWT token history"

    def __str__(self):
        return f"{self.user.email} - {self.source} - {self.created_at:%Y-%m-%d %H:%M}"

    @staticmethod
    def _exp_to_datetime(exp_value):
        if not exp_value:
            return None
        return datetime.fromtimestamp(exp_value, tz=dt_timezone.utc)

    @classmethod
    def record_tokens(cls, user, refresh_token, access_token, source):
        refresh_payload = refresh_token.payload
        access_payload = access_token.payload
        return cls.objects.create(
            user=user,
            source=source,
            access_token=str(access_token),
            refresh_token=str(refresh_token),
            access_token_jti=access_payload.get("jti", ""),
            refresh_token_jti=refresh_payload.get("jti", ""),
            access_expires_at=cls._exp_to_datetime(access_payload.get("exp")),
            refresh_expires_at=cls._exp_to_datetime(refresh_payload.get("exp")),
        )

# Create your models here.
