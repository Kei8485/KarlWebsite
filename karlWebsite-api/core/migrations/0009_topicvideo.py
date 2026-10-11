from django.db import migrations, models
import django.db.models.deletion


def copy_legacy_topic_videos(apps, schema_editor):
    Topic = apps.get_model('core', 'Topic')
    TopicVideo = apps.get_model('core', 'TopicVideo')
    for topic in Topic.objects.exclude(youtube_url='').iterator():
        TopicVideo.objects.create(topic_id=topic.id, url=topic.youtube_url, order=1)


class Migration(migrations.Migration):
    dependencies = [('core', '0008_hash_existing_codepasses')]

    operations = [
        migrations.CreateModel(
            name='TopicVideo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('url', models.URLField()),
                ('order', models.PositiveIntegerField(default=1)),
                ('topic', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='videos', to='core.topic')),
            ],
            options={'ordering': ['order', 'id']},
        ),
        migrations.RunPython(copy_legacy_topic_videos, migrations.RunPython.noop),
    ]
