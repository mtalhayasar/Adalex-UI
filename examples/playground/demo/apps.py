"""Django app configuration for demo app"""

from django.apps import AppConfig


class DemoConfig(AppConfig):
    """Configuration for demo app"""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'demo'
    verbose_name = 'Adalex UI Demo'
