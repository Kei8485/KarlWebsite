from rest_framework import serializers
from django.utils import timezone
from django.db import transaction
from .models import Subject, Topic, TopicVideo, User, PlannerTask, StudySession, ScheduledStudy, QuizQuestion

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'topic', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option']

class TopicVideoSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = TopicVideo
        fields = ['id', 'url', 'order']
        extra_kwargs = {'id': {'required': False}}

class TopicSerializer(serializers.ModelSerializer):
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        write_only=True,
    )
    questions = QuizQuestionSerializer(many=True, read_only=True)
    videos = TopicVideoSerializer(many=True, required=False)
    
    class Meta:
        model = Topic #model is suspected by the ModelSerializer
        fields = ['id', 'subject', 'title', 'notes', 'youtube_url', 'order', 'questions', 'videos']

    def validate_videos(self, videos):
        if not self.instance:
            if any('id' in video for video in videos):
                raise serializers.ValidationError('New topics cannot reference existing videos.')
            return videos

        supplied_id_list = [video['id'] for video in videos if 'id' in video]
        supplied_ids = set(supplied_id_list)
        existing_ids = set(self.instance.videos.filter(id__in=supplied_ids).values_list('id', flat=True))
        if len(supplied_ids) != len(supplied_id_list):
            raise serializers.ValidationError('A video may only be included once.')
        if supplied_ids != existing_ids:
            raise serializers.ValidationError('A video does not belong to this topic.')
        return videos

    @transaction.atomic
    def create(self, validated_data):
        videos = validated_data.pop('videos', None)
        legacy_url = validated_data.get('youtube_url', '')
        topic = super().create(validated_data)

        if videos is None:
            videos = [{'url': legacy_url, 'order': 1}] if legacy_url else []
        self._save_videos(topic, videos)
        return topic

    @transaction.atomic
    def update(self, instance, validated_data):
        videos = validated_data.pop('videos', None)
        legacy_url = validated_data.get('youtube_url')
        topic = super().update(instance, validated_data)

        if videos is not None:
            self._save_videos(topic, videos)
        elif legacy_url is not None:
            if legacy_url:
                first_video = topic.videos.first()
                if first_video:
                    first_video.url = legacy_url
                    first_video.save(update_fields=['url'])
                else:
                    TopicVideo.objects.create(topic=topic, url=legacy_url, order=1)
            else:
                topic.videos.all().delete()
        return topic

    @staticmethod
    def _save_videos(topic, videos):
        retained_ids = []
        for index, video_data in enumerate(videos, start=1):
            video_id = video_data.get('id')
            values = {
                'url': video_data['url'],
                'order': video_data.get('order', index),
            }
            if video_id:
                TopicVideo.objects.filter(topic=topic, id=video_id).update(**values)
                retained_ids.append(video_id)
            else:
                retained_ids.append(TopicVideo.objects.create(topic=topic, **values).id)

        topic.videos.exclude(id__in=retained_ids).delete()
        first_video = topic.videos.first()
        topic.youtube_url = first_video.url if first_video else ''
        topic.save(update_fields=['youtube_url'])

class SubjectSerializer(serializers.ModelSerializer): # happends first
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = ['id', 'title', 'description', 'category', 'course_code', 'topics']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'userName', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']
        
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