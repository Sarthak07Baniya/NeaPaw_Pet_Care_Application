from django.contrib import admin
from .models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# Register your models here.

@admin.register(User)
class UserAdmin(BaseUserAdmin):

    """Custom admin interface for the User model."""

    list_display = ('email', 'username', 'first_name', 'last_name', 'contact_number', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'dark_mode', 'notifications_enabled', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'contact_number')
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'contact_number', 'profile_picture')}),
        ('Preferences', {'fields': ('dark_mode', 'notifications_enabled')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


    add_fieldsets = (

        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password', 'password2'), 
        }),
    )
