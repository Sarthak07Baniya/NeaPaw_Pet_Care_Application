from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hostel', '0002_link_hostel_bookings_to_orders'),
        ('orders', '0003_add_hostel_statuses'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hostelbooking',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('check_in', 'Check-in'), ('in_stay', 'In Stay'), ('check_out', 'Check-out'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='pending', max_length=20),
        ),
    ]
