from rest_framework import serializers
from .models import Subject, Topic
from rest_framework import serializers
from .models import User

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
        # We purposely leave out 'codePass' so hackers can't see passwords in the browser!
        fields = ['id', 'email', 'userName', 'role', 'created_at']