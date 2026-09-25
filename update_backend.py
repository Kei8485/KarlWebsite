
import os

# UPDATE VIEWS.PY
views_path = r'C:\Users\ynand\Desktop\KarlWebsite\karlWebsite-api\core\views.py'
with open(views_path, 'r', encoding='utf-8') as f:
    views_content = f.read()

new_views = """
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

"""

if 'def create_subject' not in views_content:
    with open(views_path, 'a', encoding='utf-8') as f:
        f.write(new_views)
    print('Added CMS views to views.py')

# UPDATE URLS.PY
urls_path = r'C:\Users\ynand\Desktop\KarlWebsite\karlWebsite-api\core\urls.py'
with open(urls_path, 'r', encoding='utf-8') as f:
    urls_content = f.read()

new_urls = """
    # CMS Endpoints
    path('subjects/create/', views.create_subject, name='create_subject'),
    path('subjects/manage/<int:subject_id>/', views.manage_subject, name='manage_subject'),
    path('topics/create/', views.create_topic, name='create_topic'),
    path('topics/manage/<int:topic_id>/', views.manage_topic, name='manage_topic'),
    path('quizzes/create/', views.create_quiz, name='create_quiz'),
    path('quizzes/manage/<int:quiz_id>/', views.manage_quiz, name='manage_quiz'),
"""

if 'subjects/create/' not in urls_content:
    urls_content = urls_content.replace(']', new_urls + '\n]')
    with open(urls_path, 'w', encoding='utf-8') as f:
        f.write(urls_content)
    print('Added CMS urls to urls.py')

