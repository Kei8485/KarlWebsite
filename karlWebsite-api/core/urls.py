from django.urls import path
from . import views

urlpatterns = [
    path('subjects/', views.get_subjects),
    path('subjects/<int:subject_id>/topics/', views.get_subject_topics),
    path('topics/<int:topic_id>/', views.get_topic),
    path('login/', views.login),
    path('forgot-code/', views.forgot_code),
    path('users/', views.get_all_users),
    path('users/create/', views.create_user),
    path('users/delete/<int:pk>/', views.delete_user),
    path('subjects/<int:subject_id>/topics/', views.get_subject_topics),
    path('topics/<int:pk>/', views.get_topic_detail),
]