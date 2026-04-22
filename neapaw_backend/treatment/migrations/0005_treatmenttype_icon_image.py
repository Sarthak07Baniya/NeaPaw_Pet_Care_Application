from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('treatment', '0004_treatmentchatmessage_alter_treatmentbooking_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='treatmenttype',
            name='icon_image',
            field=models.ImageField(blank=True, null=True, upload_to='treatment_types/'),
        ),
    ]
