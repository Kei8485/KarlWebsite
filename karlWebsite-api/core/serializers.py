from rest_framework import serializers
from django.utils import timezone
from .models import Subject, Topic, User, PlannerTask, StudySession, ScheduledStudy, QuizQuestion

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'topic', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option']

class TopicSerializer(serializers.ModelSerializer):
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        write_only=True,
    )
    questions = QuizQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Topic #model is suspected by the ModelSerializer
        fields = ['id', 'subject', 'title', 'notes', 'youtube_url', 'order', 'questions']

class SubjectSerializer(serializers.ModelSerializer): # happends first
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'title', 'description', 'category', 'course_code', 'topics']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'userName', 'role', 'created_at']
        read_only_fields = ['id', 'role', 'created_at']
        
class PlannerTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlannerTask
        fields = '__all__'
        read_only_fields = ['user', 'created_at']
class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

class ScheduledStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledStudy
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

    def validate_scheduled_time(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError('Scheduled time must be in the future.')
        return value