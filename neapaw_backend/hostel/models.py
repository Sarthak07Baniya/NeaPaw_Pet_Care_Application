from django.db import models
from django.conf import settings
from pets.models import Pet
from treatment.models import TreatmentType
from orders.models import ChatMessage
import re
import uuid

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
        ('check_in', 'Check-in'),
        ('in_stay', 'In Stay'),
        ('check_out', 'Check-out'),
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
    order = models.OneToOneField('orders.Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_hostel_booking')

    def __str__(self):
        return f"Hostel for {self.pet.name} ({self.check_in_date} to {self.check_out_date})"

    def _extract_payment_method(self):
        if not self.allergies:
            return 'hostel'
        match = re.search(r'Payment:\s*([^,\n]+)', self.allergies)
        return match.group(1).strip() if match else 'hostel'

    def _map_status_to_order_status(self):
        return {
            'pending': 'pending',
            'confirmed': 'confirmed',
            'check_in': 'check_in',
            'in_stay': 'in_stay',
            'check_out': 'check_out',
            'completed': 'completed',
            'cancelled': 'cancelled',
        }.get(self.status, 'pending')

    def _tracking_message_for_status(self):
        return {
            'pending': 'Hostel booking has been placed successfully.',
            'confirmed': 'Hostel booking has been confirmed.',
            'check_in': 'Pet has checked in to the hostel.',
            'in_stay': 'Pet is currently staying at the hostel.',
            'check_out': 'Pet has checked out from the hostel.',
            'completed': 'Hostel stay has been completed.',
            'cancelled': 'Hostel booking has been cancelled.',
        }.get(self.status, 'Hostel booking has been updated.')

    def _sync_order(self, previous_status=None):
        from orders.models import Order

        mapped_status = self._map_status_to_order_status()
        total_price = self.total_price or self.calculate_price()
        payment_method = self._extract_payment_method()

        if not self.order_id:
            order = Order.objects.create(
                user=self.user,
                order_number=f"HOSTEL-{uuid.uuid4().hex[:10].upper()}",
                order_type='hostel',
                status=mapped_status,
                subtotal=total_price,
                discount=0,
                tax=0,
                shipping_fee=0,
                total=total_price,
                payment_method=payment_method,
            )
            type(self).objects.filter(pk=self.pk).update(order=order)
            self.order = order
            order.add_tracking(mapped_status, self._tracking_message_for_status())
            return

        order = self.order
        order.status = mapped_status
        order.subtotal = total_price
        order.total = total_price
        if payment_method:
            order.payment_method = payment_method
        order.save()

        if previous_status != self.status:
            order.add_tracking(mapped_status, self._tracking_message_for_status())
    
    def save(self, *args, **kwargs):
        """Validate dates and calculate price"""
        previous_status = None
        if self.pk:
            previous_status = (
                HostelBooking.objects.filter(pk=self.pk)
                .values_list('status', flat=True)
                .first()
            )

        # Validate check-out is after check-in
        if self.check_out_date <= self.check_in_date:
            from django.core.exceptions import ValidationError
            raise ValidationError('Check-out date must be after check-in date')
        
        # Calculate total price if not set
        if not self.total_price or self.total_price == 0:
            self.total_price = self.calculate_price()
        
        super().save(*args, **kwargs)
        self._sync_order(previous_status=previous_status)
    
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


class HostelReview(models.Model):
    booking = models.ForeignKey(HostelBooking, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='hostel_reviews')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['booking', 'user'], name='unique_hostel_review_per_user_booking')
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"Hostel review for {self.booking} by {self.user}"


class HostelChatMessage(ChatMessage):
    class Meta:
        proxy = True
        app_label = 'hostel'
        verbose_name = 'Hostel Chat Message'
        verbose_name_plural = 'Hostel Chat Messages'
