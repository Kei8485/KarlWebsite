from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = 'core'

    def ready(self):
        import os
        # Prevent the scheduler from running twice in development (Django runs 2 processes for reloading)
        if os.environ.get('RUN_MAIN', None) != 'true':
            from . import scheduler
            scheduler.start_scheduler()
