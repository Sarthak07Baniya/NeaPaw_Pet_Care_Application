from django.contrib import admin
from .models import ShippingAddress, SavedCard


@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    """Admin configuration for ShippingAddress model"""
    list_display = ('full_name', 'user', 'city', 'state', 'postal_code', 'country', 'is_default')
    list_filter = ('is_default', 'country', 'state')
    search_fields = ('user__email', 'full_name', 'city', 'address_line1', 'postal_code')
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'full_name', 'phone')
        }),
        ('Address', {
            'fields': ('address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country')
        }),
        ('Preferences', {
            'fields': ('is_default',)
        }),
    )
    
    actions = ['set_as_default']
    
    def set_as_default(self, request, queryset):
        """Set selected address as default"""
        if queryset.count() > 1:
            self.message_user(request, 'Please select only one address to set as default.', level='error')
            return
        
        address = queryset.first()
        ShippingAddress.objects.filter(user=address.user).update(is_default=False)
        address.is_default = True
        address.save()
        self.message_user(request, f'Address for {address.full_name} set as default.')
    set_as_default.short_description = 'Set as default address'


@admin.register(SavedCard)
class SavedCardAdmin(admin.ModelAdmin):
    """Admin configuration for SavedCard model"""
    list_display = ('user', 'card_type', 'last_four_digits', 'cardholder_name', 'get_expiry', 'is_default')
    list_filter = ('card_type', 'is_default')
    search_fields = ('user__email', 'cardholder_name', 'last_four_digits')
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Card Details', {
            'fields': ('card_type', 'last_four_digits', 'cardholder_name', 'expiry_month', 'expiry_year')
        }),
        ('Preferences', {
            'fields': ('is_default',)
        }),
    )
    
    def get_expiry(self, obj):
        """Display expiry date"""
        return f"{obj.expiry_month:02d}/{obj.expiry_year}"
    get_expiry.short_description = 'Expiry Date'
    
    actions = ['set_as_default']
    
    def set_as_default(self, request, queryset):
        """Set selected card as default"""
        if queryset.count() > 1:
            self.message_user(request, 'Please select only one card to set as default.', level='error')
            return
        
        card = queryset.first()
        SavedCard.objects.filter(user=card.user).update(is_default=False)
        card.is_default = True
        card.save()
        self.message_user(request, f'Card ending in {card.last_four_digits} set as default.')
    set_as_default.short_description = 'Set as default card'
