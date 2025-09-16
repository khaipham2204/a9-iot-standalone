from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from main.models import JobConfig
from apscheduler.schedulers.background import BackgroundScheduler
from django_apscheduler.jobstores import DjangoJobStore
from main import tasks

scheduler = BackgroundScheduler()
scheduler.add_jobstore(DjangoJobStore(), "default")

def sync_job(job):
    job_id = f"job_{job.id}"
    if job.enabled:
        scheduler.add_job(
            tasks.save_pm25_sensor_data,
            'interval',
            minutes=job.interval_minutes,
            id=job_id,
            replace_existing=True,
            max_instances=1,
        )
    else:
        try:
            scheduler.remove_job(job_id)
        except Exception:
            pass

@receiver(post_save, sender=JobConfig)
def on_jobconfig_save(sender, instance, **kwargs):
    sync_job(instance)

@receiver(post_delete, sender=JobConfig)
def on_jobconfig_delete(sender, instance, **kwargs):
    job_id = f"job_{instance.id}"
    try:
        scheduler.remove_job(job_id)
    except Exception:
        pass

def sync_all_jobs():
    for job in JobConfig.objects.all():
        sync_job(job)

# Call sync_all_jobs() at startup (e.g., in AppConfig.ready())