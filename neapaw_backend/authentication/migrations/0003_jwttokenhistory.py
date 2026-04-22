from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0002_user_password_reset_otp_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="JWTTokenHistory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("source", models.CharField(choices=[("register", "Register"), ("login", "Login")], max_length=20)),
                ("access_token", models.TextField()),
                ("refresh_token", models.TextField()),
                ("access_token_jti", models.CharField(blank=True, max_length=255)),
                ("refresh_token_jti", models.CharField(blank=True, max_length=255)),
                ("access_expires_at", models.DateTimeField(blank=True, null=True)),
                ("refresh_expires_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="jwt_token_history",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "JWT token history",
                "verbose_name_plural": "JWT token history",
                "ordering": ("-created_at",),
            },
        ),
    ]
