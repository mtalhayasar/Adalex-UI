"""URL configuration for demo app"""

from django.urls import path
from . import views

app_name = 'demo'

urlpatterns = [
    path('', views.index, name='index'),
    path('forms/basic/', views.forms_basic, name='forms_basic'),
    path('forms/advanced/', views.forms_advanced, name='forms_advanced'),
    path('forms/complete/', views.form_demo, name='form_demo'),
    path('components/ui/', views.components_ui, name='components_ui'),
    path('components/advanced/', views.components_advanced, name='components_advanced'),
    path('components/complex/', views.components_complex, name='components_complex'),
    path('navigation/', views.navigation_demo, name='navigation_demo'),
    path('table/', views.table_demo, name='table_demo'),
    path('auth/', views.auth_demo, name='auth_demo'),
    path('dialogs/', views.dialogs_demo, name='dialogs_demo'),
    path('detail/', views.detail_demo, name='detail_demo'),
    path('upload/', views.upload_demo, name='upload_demo'),
    path('filter/', views.filter_demo, name='filter_demo'),
    path('loading/', views.loading_demo, name='loading_demo'),
    path('accessibility/', views.accessibility_demo, name='accessibility_demo'),
    path('carousel/', views.carousel_demo, name='carousel_demo'),
    path('new-components/', views.new_components_demo, name='new_components_demo'),
]
