from django.db import migrations, models
import django.db.models.deletion
import uuid


def create_orders_for_existing_bookings(apps, schema_editor):
    TreatmentBooking = apps.get_model('treatment', 'TreatmentBooking')
    Order = apps.get_model('orders', 'Order')

    status_map = {
        'pending': 'pending',
        'confirmed': 'confirmed',
        'completed': 'completed',
        'cancelled': 'cancelled',
    }

    for booking in TreatmentBooking.objects.filter(order__isnull=True):
        order = Order.objects.create(
            user=booking.user,
            order_number=f"TREAT-{uuid.uuid4().hex[:10].upper()}",
            order_type='treatment',
            status=status_map.get(booking.status, 'pending'),
            subtotal=booking.price,
            discount=0,
            tax=0,
            shipping_fee=0,
            total=booking.price,
            payment_method='treatment',
            shipping_address=None,
        )
        booking.order = order
        booking.save(update_fields=['order'])


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_add_completed_status'),
        ('treatment', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='treatmentbooking',
            name='order',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='linked_treatment_booking', to='orders.order'),
        ),
        migrations.RunPython(create_orders_for_existing_bookings, migrations.RunPython.noop),
    ]
