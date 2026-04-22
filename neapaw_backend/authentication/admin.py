from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, JWTTokenHistory


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for User model"""
    list_display = ('email', 'username', 'first_name', 'last_name', 'contact_number', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'dark_mode', 'notifications_enabled', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'contact_number')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'contact_number', 'profile_picture')}),
        ('Preferences', {'fields': ('dark_mode', 'notifications_enabled')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password', 'password2'), # Corrected 'password1' to 'password'
        }),
    )


@admin.register(JWTTokenHistory)
class JWTTokenHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "source",
        "access_token_jti",
        "refresh_token_jti",
        "created_at",
    )
    list_filter = ("source", "created_at")
    search_fields = (
        "user__email",
        "user__username",
        "access_token_jti",
        "refresh_token_jti",
    )
    ordering = ("-created_at",)
    readonly_fields = (
        "user",
        "source",
        "access_token",
        "refresh_token",
        "access_token_jti",
        "refresh_token_jti",
        "access_expires_at",
        "refresh_expires_at",
        "created_at",
    )
    fieldsets = (
        (None, {"fields": ("user", "source", "created_at")}),
        (
            "Token Details",
            {
                "fields": (
                    "access_token_jti",
                    "refresh_token_jti",
                    "access_expires_at",
                    "refresh_expires_at",
                )
            },
        ),
        ("Raw Tokens", {"fields": ("access_token", "refresh_token")}),
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
