from django.contrib import admin
from .models import HostelBooking, HostelReview, HostelChatMessage


class HostelReviewInline(admin.TabularInline):
    model = HostelReview
    extra = 0
    readonly_fields = ('user', 'rating', 'comment', 'created_at')
    can_delete = False


@admin.register(HostelBooking)
class HostelBookingAdmin(admin.ModelAdmin):
    """Admin configuration for HostelBooking model"""
    list_display = ('user', 'pet', 'room', 'check_in_date', 'check_out_date', 'service_type', 'status', 'total_price')
    list_filter = ('status', 'service_type', 'diet_type', 'communicable_disease', 'check_in_date')
    search_fields = ('user__email', 'pet__name', 'room__name')
    readonly_fields = ('selected_additional_treatments', 'created_at', 'updated_at')
    date_hierarchy = 'check_in_date'
    inlines = [HostelReviewInline]
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('user', 'pet', 'room', 'check_in_date', 'check_out_date', 'service_type')
        }),
        ('Additional Services', {
            'fields': ('selected_additional_treatments',)
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
    
    actions = ['confirm_bookings', 'mark_check_in', 'mark_in_stay', 'mark_check_out', 'complete_bookings', 'cancel_bookings']

    def selected_additional_treatments(self, obj):
        treatments = list(obj.additional_treatments.values_list('name', flat=True))
        return ', '.join(treatments) if treatments else '-'
    selected_additional_treatments.short_description = 'Additional Treatments'

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name == 'status':
            allowed_statuses = {'confirmed', 'check_in', 'in_stay', 'check_out'}
            kwargs['choices'] = [
                choice for choice in db_field.choices if choice[0] in allowed_statuses
            ]
        return super().formfield_for_choice_field(db_field, request, **kwargs)
    
    def confirm_bookings(self, request, queryset):
        """Confirm selected bookings"""
        updated = 0
        for booking in queryset.filter(status='pending'):
            booking.status = 'confirmed'
            booking.save(update_fields=['status'])
            updated += 1
        self.message_user(request, f'{updated} bookings confirmed.')
    confirm_bookings.short_description = 'Confirm selected bookings'
    
    def complete_bookings(self, request, queryset):
        """Complete selected bookings"""
        updated = 0
        for booking in queryset.filter(status='check_out'):
            booking.status = 'completed'
            booking.save(update_fields=['status'])
            updated += 1
        self.message_user(request, f'{updated} bookings completed.')
    complete_bookings.short_description = 'Complete selected bookings'

    def mark_check_in(self, request, queryset):
        """Mark selected bookings as checked in"""
        updated = 0
        for booking in queryset.filter(status='confirmed'):
            booking.status = 'check_in'
            booking.save(update_fields=['status'])
            updated += 1
        self.message_user(request, f'{updated} bookings marked as check-in.')
    mark_check_in.short_description = 'Mark selected bookings as check-in'

    def mark_in_stay(self, request, queryset):
        """Mark selected bookings as in stay"""
        updated = 0
        for booking in queryset.filter(status__in=['check_in', 'confirmed']):
            booking.status = 'in_stay'
            booking.save(update_fields=['status'])
            updated += 1
        self.message_user(request, f'{updated} bookings marked as in stay.')
    mark_in_stay.short_description = 'Mark selected bookings as in stay'

    def mark_check_out(self, request, queryset):
        """Mark selected bookings as checked out"""
        updated = 0
        for booking in queryset.filter(status__in=['in_stay', 'check_in']):
            booking.status = 'check_out'
            booking.save(update_fields=['status'])
            updated += 1
        self.message_user(request, f'{updated} bookings marked as check-out.')
    mark_check_out.short_description = 'Mark selected bookings as check-out'
    
    def cancel_bookings(self, request, queryset):
        """Cancel selected bookings"""
        updated = 0
        for booking in queryset.exclude(status='cancelled'):
            booking.status = 'cancelled'
            booking.save(update_fields=['status'])
            updated += 1
        self.message_user(request, f'{updated} bookings cancelled.')
    cancel_bookings.short_description = 'Cancel selected bookings'


@admin.register(HostelReview)
class HostelReviewAdmin(admin.ModelAdmin):
    list_display = ('booking', 'user', 'rating', 'created_at')
    search_fields = ('booking__pet__name', 'user__email', 'comment')
    readonly_fields = ('booking', 'user', 'rating', 'comment', 'created_at')


@admin.register(HostelChatMessage)
class HostelChatMessageAdmin(admin.ModelAdmin):
    list_display = ('order', 'sender', 'is_admin_reply', 'timestamp')
    list_filter = ('is_admin_reply', 'timestamp', 'order')
    search_fields = ('order__order_number', 'sender__email', 'message')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.filter(order__order_type='hostel')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'order':
            kwargs['queryset'] = db_field.remote_field.model.objects.filter(order_type='hostel')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        if not obj.sender_id:
            obj.sender = request.user
        if request.user.is_staff:
            obj.is_admin_reply = True
        super().save_model(request, obj, form, change)
