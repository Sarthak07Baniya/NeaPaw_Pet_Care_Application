from django.contrib import admin
from .models import TreatmentType, TreatmentBooking

@admin.register(TreatmentType)

class TreatmentTypeAdmin(admin.ModelAdmin):
    """Admin configuration for TreatmentType model"""
    list_display = ('name', 'base_price', 'duration_minutes','icon')
    search_fields = ('name', 'description')


    fieldsets = (
        (
            'Basic Information', {
                'fields': ('name', 'description', 'icon')
            }
        ),

        (
            'Pricing & Duration', {

                'fields' : ('base_price', 'duration_minutes')
            }
         
         ),
        
    )


@admin.register(TreatmentBooking)
class TreatmentBookingAdmin(admin.ModelAdmin):
    """Admin Configuration for TreatmentBooking model"""
    list_display = ('user', 'pet', 'treatment_type', 'appointment_time', 'service_type', 'status', 'price')
    list_filter = ('status', 'service_type', 'appointment_date', 'created_at')
    search_fields = ('user__email', 'pet__name', 'treatment_type__name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'appointment_date'


    fieldsets = (

        (
            'Booking Information', {
                'fields': ('user', 'pet', 'treatment_type')
            }
        ),

        (
            'Appointment Details', {

                'fields': ('appointment_date', 'appointment_time', 'service_type', 'notes')
            }
        ),

        (
            'Status & Pricing', {

                'fields': ('created_at', 'updated_at'),
                'classes': ('collapse',)
            }
        ),
    )

    actions = ['confirm_bookings', 'complete_bookings', 'cancle_bookings']

    def confirm_bookings (self, request, queryset):
        """Confirm selected bookings"""
        updated = queryset.filter (status= 'pending').update(status='confirmed')
        self.message_user(request, f'{updated} bookings confirmed.')
    confirm_bookings.short_description = 'Confirm selected bookings'

    def complete_bookings(self, request, queryset):
        """Complete selected bookings"""
        updated = queryset.filter(status='confirmed').update(status= 'completed')
        self.message_user(request, f'{updated} bookings completed.')
    complete_bookings.short_description = 'Complete selected bookings' 

    def cancel_bookings(self, request, queryset):
        """Cancle Selected Bookings"""
        updated = queryset.update(status = 'cancelled.')
        self.message_user(request, f'{updated} bookings cancelled.')
    cancel_bookings.short_description = 'Cancel Selected Bookings.'



