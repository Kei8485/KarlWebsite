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
    path('users/<int:user_id>/tasks/', views.planner_tasks, name='planner-tasks'),
    path('tasks/<int:task_id>/', views.task_detail, name='task-detail'),
    path('users/<int:user_id>/study-sessions/', views.study_sessions, name='study-sessions'),
    path('users/<int:user_id>/tasks/', views.planner_tasks, name='planner-tasks'),
    path('tasks/<int:task_id>/', views.task_detail, name='task-detail'),
    path('users/<int:user_id>/study-sessions/', views.study_sessions, name='study-sessions'),
    path('users/<int:user_id>/schedule-study/', views.schedule_study, name='schedule-study'),
    path('scheduled-studies/<int:study_id>/', views.manage_scheduled_study, name='manage-scheduled-study'),

    # CMS Endpoints
    path('subjects/create/', views.create_subject, name='create_subject'),
    path('subjects/manage/<int:subject_id>/', views.manage_subject, name='manage_subject'),
    path('topics/create/', views.create_topic, name='create_topic'),
    path('topics/manage/<int:topic_id>/', views.manage_topic, name='manage_topic'),
    path('quizzes/create/', views.create_quiz, name='create_quiz'),
    path('quizzes/manage/<int:quiz_id>/', views.manage_quiz, name='manage_quiz'),

]