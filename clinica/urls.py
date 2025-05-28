"""
URL configuration for clinica project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from gestion import views

urlpatterns = [
    path('', views.dashboard, name='home'),  # Nueva ruta para la raíz
    path('admin/', admin.site.urls),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('accounts/', include('django.contrib.auth.urls')),

    # URLs para Especialidad
    path('especialidad/create/', views.especialidad_create, name='especialidad_create'),
    path('especialidad/<int:pk>/update/', views.especialidad_update, name='especialidad_update'),
    path('especialidad/<int:pk>/delete/', views.especialidad_delete, name='especialidad_delete'),

    # URLs para Medico
    path('medico/create/', views.medico_create, name='medico_create'),
    path('medico/<int:pk>/update/', views.medico_update, name='medico_update'),
    path('medico/<int:pk>/delete/', views.medico_delete, name='medico_delete'),

    # URLs para Paciente
    path('paciente/create/', views.paciente_create, name='paciente_create'),
    path('paciente/<int:pk>/update/', views.paciente_update, name='paciente_update'),
    path('paciente/<int:pk>/delete/', views.paciente_delete, name='paciente_delete'),

    # URLs para Cita
    path('cita/create/', views.cita_create, name='cita_create'),
    path('cita/<int:pk>/update/', views.cita_update, name='cita_update'),
    path('cita/<int:pk>/delete/', views.cita_delete, name='cita_delete'),

    # URLs para Receta
    path('receta/create/', views.receta_create, name='receta_create'),
    path('receta/<int:pk>/update/', views.receta_update, name='receta_update'),
    path('receta/<int:pk>/delete/', views.receta_delete, name='receta_delete'),
    
    # URLs para reportes
    path('reportes/', views.dashboard_reportes, name='dashboard_reportes'),
    path('reportes/ejecutar/', views.ejecutar_reporte, name='ejecutar_reporte'),
    path('reportes/exportar/pdf/', views.exportar_reporte_pdf, name='exportar_reporte_pdf'),
    path('reportes/exportar/excel/', views.exportar_reporte_excel, name='exportar_reporte_excel'),
]