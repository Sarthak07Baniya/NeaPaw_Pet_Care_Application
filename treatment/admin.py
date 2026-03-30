from django.contrib import admin
from django import forms
from django.urls import reverse
from django.utils.html import format_html
from .models import TreatmentType, TreatmentBooking, TreatmentReview, TreatmentChatMessage


TREATMENT_STATUS_CHOICES = (
    ('confirmed', 'Confirmed'),
    ('scheduled', 'Scheduled'),
    ('in_progress', 'In Progress'),
    ('completed', 'Completed'),
)


class TreatmentBookingAdminForm(forms.ModelForm):
    status = forms.ChoiceField(choices=TREATMENT_STATUS_CHOICES, required=False)

    class Meta:
        model = TreatmentBooking
        fields = '__all__'


class TreatmentReviewInline(admin.TabularInline):
    model = TreatmentReview
    extra = 0
    readonly_fields = ('user', 'rating', 'comment', 'created_at')
    can_delete = False
    fields = ('user', 'rating', 'comment', 'created_at')


@admin.register(TreatmentType) #decorator
class TreatmentTypeAdmin(admin.ModelAdmin):
    """Admin configuration for TreatmentType model"""
    list_display = ('name', 'base_price', 'duration_minutes', 'icon')
    search_fields = ('name', 'description')
    
    fieldsets = ( #section of forms
        ('Basic Information', {
            'fields': ('name', 'description', 'icon')
        }),
        ('Pricing & Duration', {
            'fields': ('base_price', 'duration_minutes')
        }),
    )


@admin.register(TreatmentBooking)
class TreatmentBookingAdmin(admin.ModelAdmin):
    """Admin configuration for TreatmentBooking model"""
    form = TreatmentBookingAdminForm
    list_display = ('user', 'pet', 'treatment_type', 'appointment_date', 'appointment_time', 'service_type', 'status', 'price')
    list_filter = ('status', 'service_type', 'appointment_date', 'created_at')
    search_fields = ('user__email', 'pet__name', 'treatment_type__name')
    readonly_fields = ('created_at', 'updated_at', 'linked_chat')
    date_hierarchy = 'appointment_date'
    inlines = [TreatmentReviewInline]
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('user', 'pet', 'treatment_type')
        }),
        ('Appointment Details', {
            'fields': ('appointment_date', 'appointment_time', 'service_type', 'notes')
        }),
        ('Status & Pricing', {
            'fields': ('status', 'price', 'linked_chat')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['confirm_bookings', 'complete_bookings', 'cancel_bookings']
    
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
        for booking in queryset.filter(status='confirmed'):
            booking.status = 'completed'
            booking.save(update_fields=['status'])
            updated += 1
        self.message_user(request, f'{updated} bookings completed.')
    complete_bookings.short_description = 'Complete selected bookings'
    
    def cancel_bookings(self, request, queryset):
        """Cancel selected bookings"""
        updated = 0
        for booking in queryset.exclude(status='cancelled'):
            booking.status = 'cancelled'
            booking.save(update_fields=['status'])
            updated += 1
        self.message_user(request, f'{updated} bookings cancelled.')
    cancel_bookings.short_description = 'Cancel selected bookings'

    def linked_chat(self, obj):
        if not obj.order_id:
            return "Not linked yet"
        url = f"{reverse('admin:treatment_treatmentchatmessage_changelist')}?order__id__exact={obj.order_id}"
        return format_html('<a href="{}">Open Treatment Chat for #{}</a>', url, obj.order.order_number)
    linked_chat.short_description = 'Support Chat'


@admin.register(TreatmentReview)
class TreatmentReviewAdmin(admin.ModelAdmin):
    list_display = ('booking', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('booking__pet__name', 'booking__user__email', 'comment')
    readonly_fields = ('created_at',)


@admin.register(TreatmentChatMessage)
class TreatmentChatMessageAdmin(admin.ModelAdmin):
    list_display = ('order', 'sender', 'is_admin_reply', 'timestamp')
    list_filter = ('is_admin_reply', 'timestamp', 'order')
    search_fields = ('order__order_number', 'sender__email', 'message')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.filter(order__order_type='treatment')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'order':
            kwargs['queryset'] = db_field.remote_field.model.objects.filter(order_type='treatment')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        if not obj.sender_id:
            obj.sender = request.user
        if request.user.is_staff:
            obj.is_admin_reply = True
        super().save_model(request, obj, form, change)
