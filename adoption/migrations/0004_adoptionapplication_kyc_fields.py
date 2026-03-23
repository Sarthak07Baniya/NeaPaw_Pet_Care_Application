from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('adoption', '0003_adoptionchatmessage'),
    ]

    operations = [
        migrations.AddField(
            model_name='adoptionapplication',
            name='email',
            field=models.EmailField(default='', max_length=254),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='adoptionapplication',
            name='full_name',
            field=models.CharField(default='', max_length=150),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='adoptionapplication',
            name='kyc_document',
            field=models.ImageField(blank=True, null=True, upload_to='adoption/applications/kyc/'),
        ),
        migrations.AddField(
            model_name='adoptionapplication',
            name='phone',
            field=models.CharField(default='', max_length=30),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='adoptionapplication',
            name='police_report',
            field=models.ImageField(blank=True, null=True, upload_to='adoption/applications/police_reports/'),
        ),
        migrations.AddField(
            model_name='adoptionapplication',
            name='user_photo',
            field=models.ImageField(blank=True, null=True, upload_to='adoption/applications/photos/'),
        ),
    ]
