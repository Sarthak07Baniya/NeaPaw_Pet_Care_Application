from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings
from shopping.models import Product
from profiles.models import ShippingAddress

class Order(models.Model):
    ORDER_TYPE_CHOICES = (
        ('shopping', 'Shopping'),
        ('treatment', 'Treatment'),
        ('hostel', 'Pet Hostel'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('check_in', 'Check-in'),
        ('in_stay', 'In Stay'),
        ('check_out', 'Check-out'),
        ('completed', 'Completed'),
        ('in_transit', 'In Transit'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('unpaid', 'Unpaid'),
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=20, unique=True)
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Financials
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    payment_method = models.CharField(max_length=50)
    payment_provider = models.CharField(max_length=50, blank=True, null=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    transaction_uuid = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    provider_reference = models.CharField(max_length=100, blank=True, null=True)
    paid_at = models.DateTimeField(blank=True, null=True)
    shipping_address = models.ForeignKey(ShippingAddress, on_delete=models.SET_NULL, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    estimated_delivery = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.order_number
    
    def save(self, *args, **kwargs):
        """Auto-generate order number if not set"""
        previous_status = None
        if self.pk:
            previous_status = Order.objects.filter(pk=self.pk).values_list('status', flat=True).first()
        if not self.order_number:
            import uuid
            from datetime import datetime
            # Generate order number: ORD-YYYYMMDD-XXXXX
            date_str = datetime.now().strftime('%Y%m%d')
            unique_id = str(uuid.uuid4().hex)[:5].upper()
            self.order_number = f'ORD-{date_str}-{unique_id}'
        super().save(*args, **kwargs)
        if previous_status != 'delivered' and self.status == 'delivered':
            self.apply_delivery_stock_updates()
    
    def calculate_total(self):
        """Calculate and return order total"""
        return self.subtotal - self.discount + self.tax + self.shipping_fee
    
    def add_tracking(self, status, message, location=''):
        """Add tracking entry for this order"""
        OrderTracking.objects.create(
            order=self,
            status=status,
            message=message,
            location=location
        )

    def apply_delivery_stock_updates(self):
        """Decrease shopping product stock when an order is delivered."""
        if self.order_type != 'shopping':
            return

        for item in self.items.select_related('product').all():
            product = item.product
            if not product:
                continue

            remaining_stock = max((product.stock_quantity or 0) - item.quantity, 0)
            product.stock_quantity = remaining_stock
            product.in_stock = remaining_stock > 0
            product.save(update_fields=['stock_quantity', 'in_stock'])

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField()
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name if self.product else 'Deleted Product'}"

class OrderTracking(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='tracking_history')
    status = models.CharField(max_length=50)
    message = models.CharField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        ordering = ['-timestamp']

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=100)
    message = models.TextField()
    notification_type = models.CharField(max_length=50) # order_update, offer, etc.
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField(blank=True, null=True) # Store related ID (e.g. order_id)

    class Meta:
        ordering = ['-created_at']

class ChatMessage(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_admin_reply = models.BooleanField(default=False)
