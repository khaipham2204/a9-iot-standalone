from django.contrib import admin, messages
from main.models import JobConfig
from django.utils.html import format_html
from django.utils import timezone
from main.signals import sync_job
from main import tasks

@admin.register(JobConfig)
class JobConfigAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'enabled', 'interval_minutes',
        'last_run_time', 'last_status_display', 'run_now_button'
    )
    list_editable = ('enabled', 'interval_minutes')
    actions = ['run_now_action']

    def last_status_display(self, obj):
        if obj.last_status == 'success':
            return '✅'
        elif obj.last_status == 'failed':
            return '❌'
        return '-'
    last_status_display.short_description = 'Last Status'

    def run_now_button(self, obj):
        return format_html(
            '<a class="button" href="{}">Run now</a>',
            f'run_now/{obj.id}/'
        )
    run_now_button.short_description = 'Run Now'
    run_now_button.allow_tags = True

    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('run_now/<int:job_id>/', self.admin_site.admin_view(self.run_now_view), name='main_job_run_now'),
        ]
        return custom_urls + urls

    def run_now_view(self, request, job_id):
        job = JobConfig.objects.get(pk=job_id)
        try:
            tasks.save_pm25_sensor_data()
            job.last_run_time = timezone.now()
            job.last_status = 'success'
            job.save()
            self.message_user(request, f"Job '{job.name}' ran successfully.", messages.SUCCESS)
        except Exception as e:
            job.last_run_time = timezone.now()
            job.last_status = 'failed'
            job.save()
            self.message_user(request, f"Job '{job.name}' failed: {e}", messages.ERROR)
        from django.shortcuts import redirect
        return redirect('admin:main_jobconfig_changelist')

    def run_now_action(self, request, queryset):
        for job in queryset:
            try:
                tasks.save_pm25_sensor_data()
                job.last_run_time = timezone.now()
                job.last_status = 'success'
                job.save()
                self.message_user(request, f"Job '{job.name}' ran successfully.", messages.SUCCESS)
            except Exception as e:
                job.last_run_time = timezone.now()
                job.last_status = 'failed'
                job.save()
                self.message_user(request, f"Job '{job.name}' failed: {e}", messages.ERROR)
    run_now_action.short_description = "Run selected jobs now"
