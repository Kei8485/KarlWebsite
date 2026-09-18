from rest_framework import serializers
from .models import Subject, Topic

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic #model is suspected by the ModelSerializer
        fields = ['id', 'title', 'notes', 'youtube_url', 'order']

class SubjectSerializer(serializers.ModelSerializer): # happends first
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'title', 'description', 'topics']