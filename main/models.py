from django.db import models

# Create your models here.

class JobConfig(models.Model):
    name = models.CharField(max_length=100, unique=True)
    enabled = models.BooleanField(default=True)
    interval_minutes = models.PositiveIntegerField(default=5)
    last_run_time = models.DateTimeField(null=True, blank=True)
    last_status = models.CharField(
        max_length=10,
        choices=[('success', '✅ Success'), ('failed', '❌ Failed')],
        null=True,
        blank=True
    )

    def __str__(self):
        return self.name
