from django.contrib import admin
from .models import HostelBooking


@admin.register(HostelBooking)
class HostelBookingAdmin(admin.ModelAdmin):
    """Admin configuration for HostelBooking model"""
    list_display = ('user', 'pet', 'check_in_date', 'check_out_date', 'service_type', 'status', 'total_price')
    list_filter = ('status', 'service_type', 'diet_type', 'communicable_disease', 'check_in_date')
    search_fields = ('user__email', 'pet__name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'check_in_date'
    filter_horizontal = ('additional_treatments',)
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('user', 'pet', 'check_in_date', 'check_out_date', 'service_type')
        }),
        ('Additional Services', {
            'fields': ('additional_treatments',)
        }),
        ('Health Information', {
            'fields': ('allergies', 'health_conditions', 'diet_type', 'pet_nature', 
                      'vaccination_status', 'communicable_disease')
        }),
        ('KYC Documents', {
            'fields': ('owner_photo', 'police_report'),
            'classes': ('collapse',)
        }),
        ('Status & Pricing', {
            'fields': ('status', 'total_price')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['confirm_bookings', 'complete_bookings', 'cancel_bookings']
    
    def confirm_bookings(self, request, queryset):
        """Confirm selected bookings"""
        updated = queryset.filter(status='pending').update(status='confirmed')
        self.message_user(request, f'{updated} bookings confirmed.')
    confirm_bookings.short_description = 'Confirm selected bookings'
    
    def complete_bookings(self, request, queryset):
        """Complete selected bookings"""
        updated = queryset.filter(status='confirmed').update(status='completed')
        self.message_user(request, f'{updated} bookings completed.')
    complete_bookings.short_description = 'Complete selected bookings'
    
    def cancel_bookings(self, request, queryset):
        """Cancel selected bookings"""
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} bookings cancelled.')
    cancel_bookings.short_description = 'Cancel selected bookings'
