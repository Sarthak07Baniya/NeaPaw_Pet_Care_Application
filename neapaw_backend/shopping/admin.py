from django.contrib import admin
from .models import Product, ProductImage, Review, Coupon, Cart, CartItem, Offer


class ProductImageInline(admin.TabularInline):
    """Inline for Product images"""
    model = ProductImage
    extra = 1
    fields = ('image', 'is_primary')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin configuration for Product model"""
    list_display = ('name', 'category', 'price', 'rating', 'reviews_count', 'stock_quantity', 'in_stock', 'created_at')
    list_filter = ('category', 'in_stock', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at', 'rating', 'reviews_count')
    inlines = [ProductImageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'stock_quantity', 'in_stock')
        }),
        ('Reviews', {
            'fields': ('rating', 'reviews_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_in_stock', 'mark_out_of_stock']
    
    def mark_in_stock(self, request, queryset):
        """Mark selected products as in stock"""
        updated = queryset.update(in_stock=True)
        self.message_user(request, f'{updated} products marked as in stock.')
    mark_in_stock.short_description = 'Mark selected products as in stock'
    
    def mark_out_of_stock(self, request, queryset):
        """Mark selected products as out of stock"""
        updated = queryset.update(in_stock=False)
        self.message_user(request, f'{updated} products marked as out of stock.')
    mark_out_of_stock.short_description = 'Mark selected products as out of stock'


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """Admin configuration for ProductImage model"""
    list_display = ('product', 'is_primary', 'image')
    list_filter = ('is_primary',)
    search_fields = ('product__name',)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Admin configuration for Review model"""
    list_display = ('product', 'user', 'rating', 'helpful_count', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('product__name', 'user__email', 'comment')
    readonly_fields = ('created_at', 'helpful_count')
    date_hierarchy = 'created_at'


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    """Admin configuration for Coupon model"""
    list_display = ('code', 'discount', 'discount_type', 'min_order', 'valid_until', 'is_active')
    list_filter = ('discount_type', 'is_active', 'valid_until')
    search_fields = ('code', 'description')
    
    fieldsets = (
        ('Coupon Details', {
            'fields': ('code', 'description')
        }),
        ('Discount Configuration', {
            'fields': ('discount', 'discount_type', 'min_order')
        }),
        ('Validity', {
            'fields': ('valid_until', 'is_active')
        }),
    )
    
    actions = ['activate_coupons', 'deactivate_coupons']
    
    def activate_coupons(self, request, queryset):
        """Activate selected coupons"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} coupons activated.')
    activate_coupons.short_description = 'Activate selected coupons'
    
    def deactivate_coupons(self, request, queryset):
        """Deactivate selected coupons"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} coupons deactivated.')
    deactivate_coupons.short_description = 'Deactivate selected coupons'


class CartItemInline(admin.TabularInline):
    """Inline for Cart items"""
    model = CartItem
    extra = 0
    readonly_fields = ('created_at', 'updated_at')
    fields = ('product', 'quantity', 'created_at')


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """Admin configuration for Cart model"""
    list_display = ('user', 'get_items_count', 'created_at', 'updated_at')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [CartItemInline]
    
    def get_items_count(self, obj):
        """Display number of items in cart"""
        return obj.items.count()
    get_items_count.short_description = 'Items Count'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """Admin configuration for CartItem model"""
    list_display = ('cart', 'product', 'quantity', 'get_subtotal', 'created_at')
    search_fields = ('cart__user__email', 'product__name')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_subtotal(self, obj):
        """Display item subtotal"""
        return f"₹{obj.subtotal}"
    get_subtotal.short_description = 'Subtotal'


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    """Admin configuration for Offer model"""
    list_display = ('title', 'category', 'discount_text', 'valid_until', 'is_active', 'created_at')
    list_filter = ('category', 'is_active', 'valid_until', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Offer Details', {
            'fields': ('title', 'description', 'image')
        }),
        ('Configuration', {
            'fields': ('discount_text', 'category', 'valid_until', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_offers', 'deactivate_offers']
    
    def activate_offers(self, request, queryset):
        """Activate selected offers"""
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} offers activated.')
    activate_offers.short_description = 'Activate selected offers'
    
    def deactivate_offers(self, request, queryset):
        """Deactivate selected offers"""
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} offers deactivated.')
    deactivate_offers.short_description = 'Deactivate selected offers'
