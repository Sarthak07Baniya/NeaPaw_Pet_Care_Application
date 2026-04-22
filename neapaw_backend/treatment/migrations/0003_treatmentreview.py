from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('treatment', '0002_link_treatment_bookings_to_orders'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='TreatmentReview',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.PositiveSmallIntegerField()),
                ('comment', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('booking', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='treatment.treatmentbooking')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='treatment_reviews', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='treatmentreview',
            constraint=models.UniqueConstraint(fields=('booking', 'user'), name='unique_treatment_review_per_user_booking'),
        ),
    ]
