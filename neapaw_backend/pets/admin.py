from django.contrib import admin
from .models import DevicePushToken, Pet, PetVaccine


@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    """Admin configuration for Pet model"""
    list_display = ('name', 'pet_type', 'breed', 'gender', 'weight', 'get_owner', 'created_at')
    list_filter = ('pet_type', 'gender', 'created_at')
    search_fields = ('name', 'breed', 'user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    #Forms
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'pet_type', 'breed')
        }),
        ('Details', {
            'fields': ('birthday', 'gender', 'weight', 'description', 'photo')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_owner(self, obj):
        """Display owner email"""
        return obj.user.email
    get_owner.short_description = 'Owner'
    get_owner.admin_order_field = 'user__email'


@admin.register(PetVaccine)
class PetVaccineAdmin(admin.ModelAdmin):
    list_display = ('name', 'pet', 'user', 'scheduled_at', 'reminder_sent_at')
    list_filter = ('created_at', 'scheduled_at', 'reminder_sent_at')
    search_fields = ('name', 'pet__name', 'user__email', 'note')
    readonly_fields = ('created_at', 'updated_at', 'reminder_sent_at')
    fieldsets = (
        ('Vaccine Reminder', {
            'fields': ('user', 'pet', 'name', 'scheduled_at', 'note')
        }),
        ('Delivery Status', {
            'fields': ('reminder_sent_at',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DevicePushToken)
class DevicePushTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'platform', 'device_name', 'is_active', 'updated_at')
    list_filter = ('platform', 'is_active', 'updated_at')
    search_fields = ('user__email', 'device_name', 'token')
    readonly_fields = ('created_at', 'updated_at')
