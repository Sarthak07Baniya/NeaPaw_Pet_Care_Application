from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_add_hostel_statuses'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='paid_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_provider',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_status',
            field=models.CharField(
                choices=[('unpaid', 'Unpaid'), ('pending', 'Pending'), ('paid', 'Paid'), ('failed', 'Failed')],
                default='unpaid',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='order',
            name='provider_reference',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='transaction_uuid',
            field=models.CharField(blank=True, db_index=True, max_length=100, null=True),
        ),
    ]
