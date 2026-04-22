from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('pets', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='DevicePushToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.TextField(unique=True)),
                ('platform', models.CharField(choices=[('android', 'Android'), ('ios', 'iOS')], max_length=20)),
                ('device_name', models.CharField(blank=True, max_length=120, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='device_push_tokens', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ('-updated_at', '-id'),
            },
        ),
        migrations.CreateModel(
            name='PetVaccine',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('scheduled_at', models.DateTimeField()),
                ('note', models.TextField(blank=True, null=True)),
                ('reminder_sent_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('pet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vaccines', to='pets.pet')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pet_vaccines', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ('scheduled_at', 'id'),
            },
        ),
    ]
