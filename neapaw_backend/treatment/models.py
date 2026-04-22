from django.db import models
from django.conf import settings
from pets.models import Pet
from orders.models import ChatMessage
import re

class TreatmentType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.IntegerField()
    icon = models.CharField(max_length=50, help_text="Icon name from frontend library")
    icon_image = models.ImageField(upload_to='treatment_types/', blank=True, null=True)
    
    def __str__(self):
        return self.name

class TreatmentBooking(models.Model):
    SERVICE_TYPE_CHOICES = (
        ('pickup', 'Pick Up'),
        ('store_visit', 'Store Visit'),
    )
    
    STATUS_CHOICES = (
        ('confirmed', 'Confirmed'),
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='treatment_bookings')
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE)
    treatment_type = models.ForeignKey(TreatmentType, on_delete=models.CASCADE)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPE_CHOICES)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    order = models.OneToOneField('orders.Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_treatment_booking')

    def __str__(self):
        return f"{self.treatment_type.name} for {self.pet.name}"

    def _extract_payment_method(self):
        if not self.notes:
            return 'treatment'
        match = re.search(r'Payment:\s*([^,\n]+)', self.notes)
        return match.group(1).strip() if match else 'treatment'

    def _map_status_to_order_status(self):
        return {
            'confirmed': 'confirmed',
            'scheduled': 'scheduled',
            'in_progress': 'in_progress',
            'completed': 'completed',
        }.get(self.status, 'confirmed')

    def _tracking_message_for_status(self):
        return {
            'confirmed': 'Treatment booking has been confirmed.',
            'scheduled': 'Treatment booking has been scheduled.',
            'in_progress': 'Treatment service is in progress.',
            'completed': 'Treatment service has been completed.',
        }.get(self.status, 'Treatment booking has been updated.')

    def _sync_order(self, previous_status=None):
        from orders.models import Order

        mapped_status = self._map_status_to_order_status()
        payment_method = self._extract_payment_method()
        price = self.price or self.treatment_type.base_price

        if not self.order_id:
            order = Order.objects.create(
                user=self.user,
                order_type='treatment',
                status=mapped_status,
                subtotal=price,
                discount=0,
                tax=0,
                shipping_fee=0,
                total=price,
                payment_method=payment_method,
            )
            type(self).objects.filter(pk=self.pk).update(order=order)
            self.order = order
            order.add_tracking(mapped_status, self._tracking_message_for_status())
            return

        order = self.order
        order.status = mapped_status
        order.subtotal = price
        order.total = price
        if payment_method:
            order.payment_method = payment_method
        order.save()

        if previous_status != self.status:
            order.add_tracking(mapped_status, self._tracking_message_for_status())
    
    def save(self, *args, **kwargs):
        """Set price from treatment type if not specified"""
        previous_status = None
        if self.pk:
            previous_status = (
                TreatmentBooking.objects.filter(pk=self.pk)
                .values_list('status', flat=True)
                .first()
            )
        if not self.price or self.price == 0:
            self.price = self.treatment_type.base_price
        super().save(*args, **kwargs) #positional arguments, keyword arguments
        self._sync_order(previous_status=previous_status)


class TreatmentReview(models.Model):
    booking = models.ForeignKey(TreatmentBooking, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='treatment_reviews')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['booking', 'user'], name='unique_treatment_review_per_user_booking')
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"Review for {self.booking} by {self.user}"


class TreatmentChatMessage(ChatMessage):
    class Meta:
        proxy = True
        app_label = 'treatment'
        verbose_name = 'Treatment Chat Message'
        verbose_name_plural = 'Treatment Chat Messages'
