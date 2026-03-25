from django.contrib import admin
from .models import Order, OrderItem, OrderTracking, ChatMessage


def shopping_only_queryset(queryset, request):
    resolver_match = getattr(request, 'resolver_match', None)
    if resolver_match and resolver_match.url_name and resolver_match.url_name.endswith('_changelist'):
        return queryset.filter(order_type='shopping')
    return queryset


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


class UserChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    can_delete = False
    verbose_name = "User Message"
    verbose_name_plural = "User Messages"
    fields = ('sender', 'message', 'timestamp')
    readonly_fields = ('sender', 'message', 'timestamp')

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.filter(is_admin_reply=False).order_by('timestamp')

    def has_add_permission(self, request, obj=None):
        return False


class AdminReplyInline(admin.TabularInline):
    model = ChatMessage
    extra = 1
    verbose_name = "Admin Reply"
    verbose_name_plural = "Admin Replies"
    fields = ('message', 'timestamp')
    readonly_fields = ('timestamp',)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.filter(is_admin_reply=True).order_by('timestamp')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin configuration for Order model"""
    list_display = ('order_number', 'user', 'status', 'total', 'payment_method', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('order_number', 'user__email', 'user__username')
    readonly_fields = ('order_number', 'order_type', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    inlines = [OrderItemInline, OrderTrackingInline, UserChatMessageInline, AdminReplyInline]
    
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

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return shopping_only_queryset(queryset, request)
    
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
        updated = 0
        for order in queryset:
            if order.status == 'delivered':
                continue
            order.status = 'delivered'
            order.save()
            updated += 1
        self.message_user(request, f'{updated} orders marked as delivered.')
    mark_delivered.short_description = 'Mark selected orders as delivered'

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for deleted_object in formset.deleted_objects:
            deleted_object.delete()
        for instance in instances:
            if isinstance(instance, ChatMessage):
                if not instance.sender_id:
                    instance.sender = request.user
                instance.is_admin_reply = True
            instance.save()
        formset.save_m2m()


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """Admin configuration for OrderItem model"""
    list_display = ('order', 'product', 'quantity', 'price_at_time')
    search_fields = ('order__order_number', 'product__name')
    readonly_fields = ('price_at_time',)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        resolver_match = getattr(request, 'resolver_match', None)
        if resolver_match and resolver_match.url_name and resolver_match.url_name.endswith('_changelist'):
            return queryset.filter(order__order_type='shopping')
        return queryset


@admin.register(OrderTracking)
class OrderTrackingAdmin(admin.ModelAdmin):
    """Admin configuration for OrderTracking model"""
    list_display = ('order', 'status', 'message', 'location', 'timestamp')
    list_filter = ('status', 'timestamp')
    search_fields = ('order__order_number', 'message', 'location')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        resolver_match = getattr(request, 'resolver_match', None)
        if resolver_match and resolver_match.url_name and resolver_match.url_name.endswith('_changelist'):
            return queryset.filter(order__order_type='shopping')
        return queryset


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """Admin configuration for ChatMessage model"""
    list_display = ('order', 'sender', 'is_admin_reply', 'timestamp')
    list_filter = ('is_admin_reply', 'timestamp')
    search_fields = ('order__order_number', 'sender__email', 'message')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        resolver_match = getattr(request, 'resolver_match', None)
        if resolver_match and resolver_match.url_name and resolver_match.url_name.endswith('_changelist'):
            return queryset.filter(order__order_type='shopping')
        return queryset

    def save_model(self, request, obj, form, change):
        if not obj.sender_id:
            obj.sender = request.user
        if request.user.is_staff:
            obj.is_admin_reply = True
        super().save_model(request, obj, form, change)
