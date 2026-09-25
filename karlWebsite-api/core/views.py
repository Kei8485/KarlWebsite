from django.shortcuts import render

# Create your views here.
from django.utils import timezone
from datetime import timedelta
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Subject, Topic, User, PlannerTask, StudySession

from .serializers import SubjectSerializer, TopicSerializer, QuizQuestionSerializer, UserSerializer, PlannerTaskSerializer, StudySessionSerializer


@api_view(['GET'])
def get_subjects(request):
    subjects = Subject.objects.all()
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_subject_topics(request, subject_id):
    try:
        subject = Subject.objects.get(id=subject_id)
        topics = Topic.objects.filter(subject=subject).order_by('order')
        
        return Response({
          'id': subject.id,
          'title': subject.title,
          'description': subject.description,
          'topics': TopicSerializer(topics, many=True).data
      })
    except Subject.DoesNotExist:
        return Response({'error': 'Subject not found'}, status=404)
    except Subject.DoesNotExist:
        return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = SubjectSerializer(subject)
    return Response(serializer.data) # Since API na ung ginagawa ko dapat Response() gagamitin para ireturn

@api_view(['GET'])
def get_topic_detail(request, pk):
    try:
        topic = Topic.objects.get(id=pk)
        serializer = TopicSerializer(topic)
        return Response(serializer.data)
    except Topic.DoesNotExist:
        return Response({'error': 'Topic not found'}, status=404)


@api_view(['GET'])
def get_topic(request, topic_id):
    try:
        topic = Topic.objects.get(id=topic_id)
    except Topic.DoesNotExist:
        return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = TopicSerializer(topic)
    return Response(serializer.data)

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    code = request.data.get('code')
    try:
        user = User.objects.get(email=email, codePass=code)
        return Response({'success': True, 'role': user.role, 'userName': user.userName})
    except User.DoesNotExist:
        return Response({'error': 'Invalid email or code'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def forgot_code(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        user.generate_code()

        text_content = f'Your new access code is: {user.codePass}'
        html_content = f'''
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border:1px solid #1e293b;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:32px 40px 24px 40px;border-bottom:1px solid #1e293b;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background-color:#2563eb;border-radius:8px;padding:8px 12px;">
                <span style="color:#fff;font-size:14px;font-weight:700;">AE</span>
              </td>
              <td style="padding-left:12px;">
                <span style="color:#fff;font-size:18px;font-weight:700;">ApexEng</span><br>
                <span style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Apex Engineering</span>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="color:#94a3b8;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px 0;">New Access Code</p>
            <h1 style="color:#fff;font-size:28px;font-weight:700;margin:0 0 16px 0;">Your new code<br>is ready.</h1>
            <p style="color:#94a3b8;font-size:15px;margin:0 0 32px 0;">Here is your new access code. Your old code is no longer valid.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background-color:#1e293b;border:1px solid #334155;border-radius:10px;padding:24px;text-align:center;">
                  <p style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px 0;">Your Code</p>
                  <p style="color:#2563eb;font-size:32px;font-weight:700;letter-spacing:8px;margin:0;font-family:monospace;">{user.codePass}</p>
                </td>
              </tr>
            </table>
            <p style="color:#475569;font-size:13px;margin:0;">This code is linked to <strong style="color:#64748b;">{user.email}</strong>.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #1e293b;">
            <p style="color:#334155;font-size:12px;margin:0;text-align:center;">© 2026 ApexEng · Apex Engineering</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
'''
        msg = EmailMultiAlternatives('Your New ApexEng Access Code', text_content, settings.DEFAULT_FROM_EMAIL, [user.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        return Response({'success': True})
    except User.DoesNotExist:
        return Response({'error': 'Email not found'}, status=status.HTTP_404_NOT_FOUND)
      



# USER ADMIN HTTP REQUEST
@api_view(['GET'])
def get_all_users(request):
    users = User.objects.all().order_by('-created_at')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        new_user = serializer.save()
        
        # 🚨 Call the function from your models.py to generate the code!
        new_user.generate_code()
        
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
def delete_user(request, pk):
    try:
        user = User.objects.get(id=pk)
        user.delete()
        return Response({'message': 'User deleted successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
      
      
# 1. Manage Tasks (Get all tasks, or Create a new one)
@api_view(['GET', 'POST'])
def planner_tasks(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    if request.method == 'GET':
        tasks = PlannerTask.objects.filter(user=user).order_by('due_date')
        serializer = PlannerTaskSerializer(tasks, many=True)
        return Response(serializer.data)
        
    elif request.method == 'POST':
        # When Angular creates a new task
        data = request.data.copy()
        data['user'] = user.id
        serializer = PlannerTaskSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
      
# 2. Update or Delete a specific Task


# 2. Update or Delete a specific Task
@api_view(['PATCH', 'DELETE', 'PUT']) # 🚨 Added 'PUT' to allowed methods
def task_detail(request, task_id):
    try:
        task = PlannerTask.objects.get(id=task_id)
    except PlannerTask.DoesNotExist:
        return Response({'error': 'Task not found'}, status=404)
        
    if request.method == 'PATCH':
        # Flips it from False to True (Completed!)
        task.is_completed = not task.is_completed
        task.save()
        return Response({'message': 'Task updated', 'is_completed': task.is_completed})
        
    elif request.method == 'PUT':
        # 🚨 New block to handle saving edits from the frontend
        serializer = PlannerTaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
        
    elif request.method == 'DELETE':
        task.delete()
        return Response({'message': 'Task deleted'})
    try:
        task = PlannerTask.objects.get(id=task_id)
    except PlannerTask.DoesNotExist:
        return Response({'error': 'Task not found'}, status=404)
    if request.method == 'PATCH':
        # Flips it from False to True (Completed!)
        task.is_completed = not task.is_completed
        task.save()
        return Response({'message': 'Task updated', 'is_completed': task.is_completed})
    elif request.method == 'DELETE':
        task.delete()
        return Response({'message': 'Task deleted'})
      
# 3. Save Timer & Get Weekly Stats!
@api_view(['GET', 'POST'])
def study_sessions(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    if request.method == 'POST':
        # When the 30min timer finishes, Angular sends it here to save!
        duration = request.data.get('duration_minutes', 0)
        StudySession.objects.create(user=user, duration_minutes=duration)
        return Response({'message': 'Study session saved!'})
    elif request.method == 'GET':
        # AUTOMATICALLY CALCULATES WEEKLY STATS!
        one_week_ago = timezone.now() - timedelta(days=7)
        recent_sessions = StudySession.objects.filter(user=user, created_at__gte=one_week_ago)
        
        total_minutes = sum([session.duration_minutes for session in recent_sessions])
        hours = total_minutes // 60
        minutes = total_minutes % 60
        
        return Response({
            'total_minutes': total_minutes,
            'formatted_time': f"{hours}h {minutes}m"
        })

@api_view(['GET', 'POST'])
def schedule_study(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
        
    from .models import ScheduledStudy
    from .serializers import ScheduledStudySerializer

    if request.method == 'GET':
        # Return all scheduled studies for this user, newest first
        studies = ScheduledStudy.objects.filter(user=user).order_by('scheduled_time')
        serializer = ScheduledStudySerializer(studies, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data.copy()
        data['user'] = user.id
        serializer = ScheduledStudySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['DELETE', 'PUT'])
def manage_scheduled_study(request, study_id):
    from .models import ScheduledStudy
    from .serializers import ScheduledStudySerializer
    try:
        study = ScheduledStudy.objects.get(id=study_id)
    except ScheduledStudy.DoesNotExist:
        return Response({'error': 'Study not found'}, status=404)
        
    if request.method == 'DELETE':
        study.delete()
        return Response({'message': 'Study schedule deleted successfully.'})
        
    elif request.method == 'PUT':
        serializer = ScheduledStudySerializer(study, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
# ==========================================
# CMS ENDPOINTS (Subjects, Topics, Quizzes)
# ==========================================
from .models import QuizQuestion

@api_view(['POST'])
def create_subject(request):
    serializer = SubjectSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def manage_subject(request, subject_id):
    try:
        subject = Subject.objects.get(id=subject_id)
    except Subject.DoesNotExist:
        return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)
        
    if request.method == 'PUT':
        serializer = SubjectSerializer(subject, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':
        subject.delete()
        return Response({'message': 'Subject deleted successfully.'})


@api_view(['POST'])
def create_topic(request):
    serializer = TopicSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def manage_topic(request, topic_id):
    try:
        topic = Topic.objects.get(id=topic_id)
    except Topic.DoesNotExist:
        return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)
        
    if request.method == 'PUT':
        serializer = TopicSerializer(topic, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':
        topic.delete()
        return Response({'message': 'Topic deleted successfully.'})


@api_view(['POST'])
def create_quiz(request):
    serializer = QuizQuestionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def manage_quiz(request, quiz_id):
    try:
        quiz = QuizQuestion.objects.get(id=quiz_id)
    except QuizQuestion.DoesNotExist:
        return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
        
    if request.method == 'PUT':
        serializer = QuizQuestionSerializer(quiz, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == 'DELETE':
        quiz.delete()
        return Response({'message': 'Quiz deleted successfully.'})

