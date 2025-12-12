from django.db import models
from django.conf import settings


class ShippingAddress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    address_line1 = models.CharField(max_length=200)
    address_line2 = models.CharField(max_length=200, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='Nepal')
    is_default = models.BooleanField(default=False)


    def __str__(self):

        return f"{self.full_name}, {self.city}"
    

    def save (self, *args, **kwargs):
        if self.is_default:
            ShippingAddress.objects.filter(user=self.user).update(is_default=False)
        super().save(*args, **kwargs)

class SavedCard(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cards')
    card_type = models.CharField(max_length=50)
    last_four_digits = models.CharField(max_length=4)
    expiry_month = models.IntegerField()
    expiry_year = models.IntegerField()
    cardholder_name = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)


    def __str__(self):
        return f"{self.card_type} ending in {self.last_four_digits}"
