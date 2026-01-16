from rest_framework import serializers
from .models import Product, ProductImage, Review, Coupon, Cart, CartItem, Offer

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'is_primary')

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')
    
    class Meta:
        model = Review
        fields = ('id', 'user_name', 'rating', 'comment', 'created_at', 'helpful_count')
        read_only_fields = ('user', 'helpful_count')
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def validate_comment(self, value):
        """Validate comment has minimum length"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Review comment must be at least 10 characters long")
        return value

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'
    
    def validate(self, data):
        """Validate coupon validity"""
        from datetime import date
        if 'valid_until' in data and data['valid_until'] < date.today():
            raise serializers.ValidationError("Coupon expiry date cannot be in the past")
        return data

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_id', 'quantity', 'subtotal')
    
    def validate(self, data):
        """Validate product stock availability"""
        product = data.get('product')
        quantity = data.get('quantity', 1)
        
        if not product.in_stock:
            raise serializers.ValidationError("This product is currently out of stock")
        
        if product.stock_quantity < quantity:
            raise serializers.ValidationError(
                f"Only {product.stock_quantity} units available in stock"
            )
        
        return data

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ('id', 'items', 'total')

    def get_total(self, obj):
        return sum(item.subtotal for item in obj.items.all())

class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = '__all__'
