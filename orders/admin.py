from django.contrib import admin
from .models import Order, OrderItem, OrderTracking, Notification, ChatMessage


class OrderItemInline(admin.TabularInline):
    """Inline for Order items"""
    model = OrderItem
    extra = 0
    readonly_fields = ('price_at_time',)
    fields = ('product', 'quantity', 'price_at_time')


class OrderTrackingInline(admin.TabularInline):
    """Inline for Order tracking"""
    model = OrderTracking
    extra = 0
    readonly_fields = ('timestamp',)
    fields = ('status', 'message', 'location', 'timestamp')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin configuration for Order model"""
    list_display = ('order_number', 'user', 'order_type', 'status', 'total', 'payment_method', 'created_at')
    list_filter = ('order_type', 'status', 'payment_method', 'created_at')
    search_fields = ('order_number', 'user__email', 'user__username')
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    inlines = [OrderItemInline, OrderTrackingInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'order_type', 'status')
        }),
        ('Financials', {
            'fields': ('subtotal', 'discount', 'tax', 'shipping_fee', 'total')
        }),
        ('Delivery', {
            'fields': ('payment_method', 'shipping_address', 'estimated_delivery')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_confirmed', 'mark_in_transit', 'mark_delivered']
    
    def mark_confirmed(self, request, queryset):
        """Mark orders as confirmed"""
        updated = queryset.update(status='confirmed')
        self.message_user(request, f'{updated} orders marked as confirmed.')
    mark_confirmed.short_description = 'Mark selected orders as confirmed'
    
    def mark_in_transit(self, request, queryset):
        """Mark orders as in transit"""
        updated = queryset.update(status='in_transit')
        self.message_user(request, f'{updated} orders marked as in transit.')
    mark_in_transit.short_description = 'Mark selected orders as in transit'
    
    def mark_delivered(self, request, queryset):
        """Mark orders as delivered"""
        updated = queryset.update(status='delivered')
        self.message_user(request, f'{updated} orders marked as delivered.')
    mark_delivered.short_description = 'Mark selected orders as delivered'


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """Admin configuration for OrderItem model"""
    list_display = ('order', 'product', 'quantity', 'price_at_time')
    search_fields = ('order__order_number', 'product__name')
    readonly_fields = ('price_at_time',)


@admin.register(OrderTracking)
class OrderTrackingAdmin(admin.ModelAdmin):
    """Admin configuration for OrderTracking model"""
    list_display = ('order', 'status', 'message', 'location', 'timestamp')
    list_filter = ('status', 'timestamp')
    search_fields = ('order__order_number', 'message', 'location')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin configuration for Notification model"""
    list_display = ('user', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('user__email', 'title', 'message')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        """Mark notifications as read"""
        updated = queryset.update(is_read=True)
        self.message_user(request, f'{updated} notifications marked as read.')
    mark_as_read.short_description = 'Mark selected notifications as read'
    
    def mark_as_unread(self, request, queryset):
        """Mark notifications as unread"""
        updated = queryset.update(is_read=False)
        self.message_user(request, f'{updated} notifications marked as unread.')
    mark_as_unread.short_description = 'Mark selected notifications as unread'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """Admin configuration for ChatMessage model"""
    list_display = ('order', 'sender', 'is_admin_reply', 'timestamp')
    list_filter = ('is_admin_reply', 'timestamp')
    search_fields = ('order__order_number', 'sender__email', 'message')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'
