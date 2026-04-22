from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_add_completed_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('check_in', 'Check-in'), ('in_stay', 'In Stay'), ('check_out', 'Check-out'), ('completed', 'Completed'), ('packed', 'Packed'), ('in_transit', 'In Transit'), ('delivered', 'Delivered'), ('cancelled', 'Cancelled')], default='pending', max_length=20),
        ),
    ]
