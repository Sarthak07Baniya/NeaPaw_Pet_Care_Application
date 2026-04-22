from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='shippingaddress',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
    ]
