"""URL configuration for demo app"""

from django.urls import path
from . import views

app_name = 'demo'

urlpatterns = [
    path('', views.index, name='index'),
    path('forms/basic/', views.forms_basic, name='forms_basic'),
    path('forms/complete/', views.form_demo, name='form_demo'),
    path('components/ui/', views.components_ui, name='components_ui'),
    path('components/advanced/', views.components_advanced, name='components_advanced'),
    path('navigation/', views.navigation_demo, name='navigation_demo'),
]
