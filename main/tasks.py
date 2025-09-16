from main.models import JobConfig
from django.utils import timezone

def save_pm25_sensor_data():
    # Example: Save PM2.5 sensor data to DB
    try:
        # Replace with actual sensor reading logic
        value = 42.0  # Dummy value
        # Save to your sensor model here
        # SensorData.objects.create(value=value, timestamp=timezone.now())
        status = 'success'
    except Exception:
        status = 'failed'
    # Update JobConfig last run/status
    JobConfig.objects.filter(name='save_pm25_sensor_data').update(
        last_run_time=timezone.now(),
        last_status=status
    )