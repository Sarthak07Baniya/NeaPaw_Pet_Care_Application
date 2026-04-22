from django.db import migrations, models
import django.db.models.deletion
import uuid


def create_orders_for_existing_bookings(apps, schema_editor):
    HostelBooking = apps.get_model('hostel', 'HostelBooking')
    Order = apps.get_model('orders', 'Order')
    db_alias = schema_editor.connection.alias

    status_map = {
        'pending': 'pending',
        'confirmed': 'confirmed',
        'completed': 'completed',
        'cancelled': 'cancelled',
    }

    for booking in HostelBooking.objects.using(db_alias).filter(order__isnull=True):
        total_price = booking.total_price or 0
        order = Order.objects.using(db_alias).create(
            user=booking.user,
            order_number=f"HOSTEL-{uuid.uuid4().hex[:10].upper()}",
            order_type='hostel',
            status=status_map.get(booking.status, 'pending'),
            subtotal=total_price,
            discount=0,
            tax=0,
            shipping_fee=0,
            total=total_price,
            payment_method='hostel',
            shipping_address=None,
        )
        booking.order = order
        booking.save(update_fields=['order'])


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_add_completed_status'),
        ('hostel', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='hostelbooking',
            name='order',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='linked_hostel_booking', to='orders.order'),
        ),
        migrations.RunPython(create_orders_for_existing_bookings, migrations.RunPython.noop),
    ]
