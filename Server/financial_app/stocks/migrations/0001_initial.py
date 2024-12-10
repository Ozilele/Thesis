# Generated by Django 5.1.2 on 2024-11-23 14:44

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True, null=True)),
                ('sector', models.CharField(blank=True, max_length=50, null=True)),
                ('ticker_symbol', models.CharField(max_length=20, unique=True)),
                ('logo', models.URLField(blank=True, null=True)),
                ('market', models.CharField(max_length=50)),
                ('sentiment', models.DecimalField(decimal_places=3, max_digits=4, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='CompanyInfo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('website', models.URLField(null=True)),
                ('country_from', models.CharField(max_length=100, null=True)),
                ('city_from', models.CharField(max_length=100, null=True)),
                ('fiftyDayAveragePrice', models.IntegerField(null=True)),
                ('fiftyTwoWeekHighPrice', models.DecimalField(decimal_places=3, max_digits=15, null=True)),
                ('fiftyTwoWeekLowPrice', models.DecimalField(decimal_places=3, max_digits=15, null=True)),
                ('dividendRate', models.DecimalField(decimal_places=3, max_digits=15, null=True)),
            ],
            options={
                'db_table': 'CompanyInfo',
            },
        ),
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source_name', models.TextField(max_length=100)),
                ('source_id', models.CharField(blank=True, max_length=100, null=True)),
                ('author', models.CharField(max_length=150, null=True)),
                ('title', models.CharField(max_length=250)),
                ('description', models.TextField()),
                ('url', models.URLField()),
                ('url_to_image', models.URLField(blank=True, null=True)),
                ('published_at', models.DateTimeField()),
                ('content', models.TextField()),
                ('articles', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='stocks.company')),
            ],
        ),
        migrations.AddField(
            model_name='company',
            name='info',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='company', to='stocks.companyinfo'),
        ),
        migrations.CreateModel(
            name='MarketData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('price', models.DecimalField(decimal_places=3, max_digits=15)),
                ('volume', models.IntegerField(blank=True, null=True)),
                ('timestamp', models.DateTimeField()),
                ('price_data', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='stocks.company')),
            ],
        ),
        migrations.CreateModel(
            name='Portfolio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_value', models.DecimalField(decimal_places=2, max_digits=16)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('total_profit', models.DecimalField(decimal_places=3, max_digits=16, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='portfolio', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Report',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.CharField(max_length=100)),
                ('data', models.TextField()),
                ('company', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reports', to='stocks.company')),
            ],
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(choices=[('B', 'Buy'), ('S', 'Sell')], max_length=1)),
                ('quantity', models.DecimalField(decimal_places=10, max_digits=150)),
                ('price', models.DecimalField(decimal_places=3, max_digits=18)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('stock', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='stocks.company')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]