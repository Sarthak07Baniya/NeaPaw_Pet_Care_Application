from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Product(models.Model):
    CATEGORY_CHOICES = (
        ('Food', 'Food'),
        ('Belt', 'Belt'),
        ('Cloth', 'Cloth'),
        ('Toys', 'Toys'),
        ('Accessories', 'Accessories'),
        ('Grooming', 'Grooming'),
    )

    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    rating = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    reviews_count = models.IntegerField(default=0)
    stock_quantity = models.IntegerField(default=0)
    in_stock = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.product.name}"

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    helpful_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"

class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = (
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
        ('shipping', 'Free Shipping'),
    )

    code = models.CharField(max_length=50, unique=True)
    discount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    description = models.TextField()
    min_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valid_until = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.code

class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.email}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
    
    @property
    def subtotal(self):
        return self.product.price * self.quantity

class Offer(models.Model):
    CATEGORY_CHOICES = (
        ('Shopping', 'Shopping'),
        ('Treatment', 'Treatment'),
        ('PetHostel', 'Pet Hostel'),
        ('Adoption', 'Adoption'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='offers/')
    discount_text = models.CharField(max_length=50, help_text="e.g. '50% OFF'")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    valid_until = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# Add these methods to Product model
def update_product_rating(product_id):
    """Update product rating based on all reviews"""
    from django.db.models import Avg
    product = Product.objects.get(id=product_id)
    avg_rating = Review.objects.filter(product=product).aggregate(Avg('rating'))['rating__avg']
    product.rating = round(avg_rating, 1) if avg_rating else 0
    product.reviews_count = Review.objects.filter(product=product).count()
    product.save()


# Override Review save to update product rating
original_review_save = Review.save
def review_save_with_rating_update(self, *args, **kwargs):
    result = original_review_save(self, *args, **kwargs)
    update_product_rating(self.product.id)
    return result
Review.save = review_save_with_rating_update
