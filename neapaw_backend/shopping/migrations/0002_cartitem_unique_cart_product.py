from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shopping', '0001_initial'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='cartitem',
            constraint=models.UniqueConstraint(
                fields=('cart', 'product'),
                name='unique_cart_product',
            ),
        ),
    ]
