from rest_framework import serializers
from .models import Subject, Topic, User, PlannerTask, StudySession, ScheduledStudy, QuizQuestion

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option']

class TopicSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Topic #model is suspected by the ModelSerializer
        fields = ['id', 'title', 'notes', 'youtube_url', 'order', 'questions']

class SubjectSerializer(serializers.ModelSerializer): # happends first
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'title', 'description', 'category', 'course_code', 'topics']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'userName', 'role', 'created_at']
        
class PlannerTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlannerTask
        fields = '__all__'
class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = '__all__'

class ScheduledStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledStudy
        fields = '__all__'