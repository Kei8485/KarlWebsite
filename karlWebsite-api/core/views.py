from django.shortcuts import render

# Create your views here.
from django.utils import timezone
from datetime import timedelta
from zoneinfo import ZoneInfo
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

from rest_framework.decorators import api_view
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
from rest_framework import status

from .models import Subject, Topic, User, PlannerTask, StudySession, SessionToken
from .authentication import IsAuthenticated, IsAdmin
from django.contrib.auth.hashers import check_password


def _is_authenticated(request):
    return bool(getattr(request, 'user', None) and getattr(request.user, 'id', None))


def _owner_or_admin(request, user_id):
    if not _is_authenticated(request):
        return Response({'detail': 'Authentication credentials were not provided.'}, status=401)
    if request.user.role != 'admin' and request.user.id != user_id:
        return Response({'detail': 'You do not have permission to access this resource.'}, status=403)
    return None


def _admin_only(request):
    if not _is_authenticated(request):
        return Response({'detail': 'Authentication credentials were not provided.'}, status=401)
    if request.user.role != 'admin':
        return Response({'detail': 'Admin permission required.'}, status=403)
    return None

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
        user = User.objects.get(email=email)
        if not check_password(code or '', user.codePass):
            raise User.DoesNotExist
        raw_token, _ = SessionToken.issue(user)
        return Response({'success': True, 'token': raw_token, 'id': user.id, 'email': user.email, 'role': user.role, 'userName': user.userName})
    except User.DoesNotExist:
        return Response({'error': 'Invalid email or code'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def forgot_code(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        user.generate_code()

        return Response({'success': True})
    except User.DoesNotExist:
        return Response({'error': 'Email not found'}, status=status.HTTP_404_NOT_FOUND)
      



# USER ADMIN HTTP REQUEST
@api_view(['GET'])
def get_all_users(request):
    denied = _admin_only(request)
    if denied: return denied
    users = User.objects.all().order_by('-created_at')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_user(request):
    denied = _admin_only(request)
    if denied: return denied
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        new_user = serializer.save()
        
        # 🚨 Call the function from your models.py to generate the code!
        new_user.generate_code()
        
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
def delete_user(request, pk):
    denied = _admin_only(request)
    if denied: return denied
    try:
        user = User.objects.get(id=pk)
        user.delete()
        return Response({'message': 'User deleted successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
      
      
# 1. Manage Tasks (Get all tasks, or Create a new one)
@api_view(['GET', 'POST'])
def planner_tasks(request, user_id):
    denied = _owner_or_admin(request, user_id)
    if denied: return denied
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
        serializer = PlannerTaskSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=user)
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
    denied = _owner_or_admin(request, task.user_id)
    if denied: return denied
        
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
    denied = _owner_or_admin(request, user_id)
    if denied: return denied
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
        # Calculate the current calendar week from Monday 00:00 in Philippine time.
        philippines_now = timezone.now().astimezone(ZoneInfo('Asia/Manila'))
        monday = philippines_now - timedelta(days=philippines_now.weekday())
        week_start = monday.replace(hour=0, minute=0, second=0, microsecond=0)
        recent_sessions = StudySession.objects.filter(
            user=user,
            created_at__gte=week_start,
        )
        
        total_minutes = sum([session.duration_minutes for session in recent_sessions])
        hours = total_minutes // 60
        minutes = total_minutes % 60
        
        return Response({
            'total_minutes': total_minutes,
            'formatted_time': f"{hours}h {minutes}m"
        })

@api_view(['GET', 'POST'])
def schedule_study(request, user_id):
    denied = _owner_or_admin(request, user_id)
    if denied: return denied
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
        serializer = ScheduledStudySerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=user)
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
    denied = _owner_or_admin(request, study.user_id)
    if denied: return denied
        
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
    denied = _admin_only(request)
    if denied: return denied
    serializer = SubjectSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def manage_subject(request, subject_id):
    denied = _admin_only(request)
    if denied: return denied
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
    denied = _admin_only(request)
    if denied: return denied
    serializer = TopicSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def manage_topic(request, topic_id):
    denied = _admin_only(request)
    if denied: return denied
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
    denied = _admin_only(request)
    if denied: return denied
    serializer = QuizQuestionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def manage_quiz(request, quiz_id):
    denied = _admin_only(request)
    if denied: return denied
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



@api_view(['PUT'])
def update_user_profile(request, user_id):
    denied = _owner_or_admin(request, user_id)
    if denied: return denied
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
    user.userName = request.data.get('userName', user.userName)
    
    codePass = request.data.get('codePass')
    if codePass:
        from django.contrib.auth.hashers import make_password
        user.codePass = make_password(codePass)
        
    user.save()
    serializer = UserSerializer(user)
    return Response(serializer.data)
