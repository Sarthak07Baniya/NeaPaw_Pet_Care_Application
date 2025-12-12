from django.contrib import admin
from .models import Pet

@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    """Admin configuration for Pet model"""

    list_display = ('name', 'pet_type', 'gender', 'breed', 'weight', 'get_owner', 'created_at')
    list_filter = ('pet_type', 'gender', 'created_at')
    search_fields = ('name', 'breed', 'user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        (
            'Basic Information', {
                'fields': ('user', 'name', 'pet_type', 'breed')
            }
        ),

        (
            'Details',{
                'fields': ('birthday', 'gender', 'weight', 'description', 'photo')
            }
        ),

        (
            'Timestamps', {
                'fields' : ('created_at', 'updated_at'),
                'classes': ('collapse',)
            }
        ),


    )

    def get_owner(self, obj):
        """Display owner email"""
        return obj.user.email
    get_owner.short_description = 'Owner'
    get_owner.admin_order_field = 'user__email'
