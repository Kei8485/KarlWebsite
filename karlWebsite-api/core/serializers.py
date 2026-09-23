from rest_framework import serializers
from .models import Subject, Topic, User, PlannerTask, StudySession, ScheduledStudy

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic #model is suspected by the ModelSerializer
        fields = ['id', 'title', 'notes', 'youtube_url', 'order']

class SubjectSerializer(serializers.ModelSerializer): # happends first
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = '__all__'
        fields = ['id', 'title', 'description', 'topics']

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