from django.contrib import admin
from .models import AdoptionPet, AdoptionApplication, AdoptionReview, AdoptionChatMessage


class AdoptionReviewInline(admin.TabularInline):
    model = AdoptionReview
    extra = 0
    readonly_fields = ('user', 'rating', 'comment', 'created_at')
    can_delete = False


@admin.register(AdoptionPet)
class AdoptionPetAdmin(admin.ModelAdmin):
    """Admin configuration for AdoptionPet model"""
    list_display = ('name', 'pet_type', 'breed', 'age_months', 'gender', 'weight', 'is_available', 'created_at')
    list_filter = ('pet_type', 'gender', 'is_available', 'created_at')
    search_fields = ('name', 'breed', 'description')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'pet_type', 'breed', 'age_months', 'gender', 'weight')
        }),
        ('Details', {
            'fields': ('description', 'photo', 'health_status', 'temperament', 'special_needs')
        }),
        ('Availability', {
            'fields': ('is_available',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_available', 'mark_unavailable']
    
    def mark_available(self, request, queryset):
        """Mark pets as available for adoption"""
        updated = queryset.update(is_available=True)
        self.message_user(request, f'{updated} pets marked as available.')
    mark_available.short_description = 'Mark selected pets as available'
    
    def mark_unavailable(self, request, queryset):
        """Mark pets as unavailable"""
        updated = queryset.update(is_available=False)
        self.message_user(request, f'{updated} pets marked as unavailable.')
    mark_unavailable.short_description = 'Mark selected pets as unavailable'


@admin.register(AdoptionApplication)
class AdoptionApplicationAdmin(admin.ModelAdmin):
    """Admin configuration for AdoptionApplication model"""
    list_display = ('user', 'pet', 'status', 'previously_owned_pets', 'submitted_at', 'reviewed_at')
    list_filter = ('status', 'previously_owned_pets', 'submitted_at')
    search_fields = ('user__email', 'pet__name', 'city', 'state')
    readonly_fields = ('submitted_at', 'reviewed_at')
    date_hierarchy = 'submitted_at'
    inlines = [AdoptionReviewInline]
    
    fieldsets = (
        ('Application Information', {
            'fields': ('user', 'pet', 'status', 'full_name', 'email', 'phone')
        }),
        ('Living Address', {
            'fields': ('address_line1', 'city', 'state', 'postal_code')
        }),
        ('KYC Documents', {
            'fields': ('kyc_document', 'user_photo', 'police_report')
        }),
        ('Pet Ownership History', {
            'fields': ('previously_owned_pets', 'previous_pet_details', 'reason_for_adoption')
        }),
        ('Review', {
            'fields': ('submitted_at', 'reviewed_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_applications', 'reject_applications']
    
    def approve_applications(self, request, queryset):
        """Approve selected applications"""
        from django.utils import timezone
        updated = 0
        for application in queryset.filter(status='pending'):
            application.status = 'approved'
            application.reviewed_at = timezone.now()
            application.save()
            # Mark pet as unavailable
            application.pet.is_available = False
            application.pet.save()
            updated += 1
        self.message_user(request, f'{updated} applications approved.')
    approve_applications.short_description = 'Approve selected applications'
    
    def reject_applications(self, request, queryset):
        """Reject selected applications"""
        from django.utils import timezone
        updated = 0
        for application in queryset.filter(status='pending'):
            application.status = 'rejected'
            application.reviewed_at = timezone.now()
            application.save()
            updated += 1
        self.message_user(request, f'{updated} applications rejected.')
    reject_applications.short_description = 'Reject selected applications'

@admin.register(AdoptionReview)
class AdoptionReviewAdmin(admin.ModelAdmin):
    list_display = ('application', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('application__pet__name', 'user__email', 'comment')
    readonly_fields = ('application', 'user', 'rating', 'comment', 'created_at')


@admin.register(AdoptionChatMessage)
class AdoptionChatMessageAdmin(admin.ModelAdmin):
    list_display = ('application', 'sender', 'is_admin_reply', 'timestamp')
    list_filter = ('is_admin_reply', 'timestamp')
    search_fields = ('application__pet__name', 'application__user__email', 'sender__email', 'message')
    readonly_fields = ('timestamp',)

    def save_model(self, request, obj, form, change):
        if not obj.sender_id:
            obj.sender = request.user
        if request.user.is_staff:
            obj.is_admin_reply = True
        super().save_model(request, obj, form, change)
