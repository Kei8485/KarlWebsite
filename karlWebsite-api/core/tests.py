from unittest.mock import patch

from django.contrib.auth.hashers import check_password, make_password
from django.test import TestCase, override_settings
from anymail.exceptions import AnymailUnsupportedFeature
from rest_framework.test import APIClient

from .models import EmailDeliveryError, SessionToken, Subject, Topic, TopicVideo, User


class SubjectContentAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.subject = Subject.objects.create(title='Mathematics')
        self.topic = Topic.objects.create(subject=self.subject, title='Algebra')

    def test_subject_and_topic_endpoints_reject_anonymous_requests(self):
        endpoints = [
            '/api/subjects/',
            f'/api/subjects/{self.subject.id}/topics/',
            f'/api/topics/{self.topic.id}/',
        ]

        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                response = self.client.get(endpoint)
                self.assertEqual(response.status_code, 401)

    def test_subject_and_topic_endpoints_allow_authenticated_requests(self):
        user = User.objects.create(email='content-reader@example.com')
        token, _ = SessionToken.issue(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        endpoints = [
            '/api/subjects/',
            f'/api/subjects/{self.subject.id}/topics/',
            f'/api/topics/{self.topic.id}/',
        ]

        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                response = self.client.get(endpoint)
                self.assertEqual(response.status_code, 200)


class LoginAuthenticationTests(TestCase):
    def test_login_ignores_a_stale_bearer_token(self):
        user = User.objects.create(
            email='login-user@example.com',
            codePass=make_password('ACCESS42'),
        )
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Bearer stale-token')

        response = client.post('/api/login/', {
            'email': user.email,
            'code': 'ACCESS42',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['id'], user.id)


class CreateTopicTests(TestCase):
    def setUp(self):
        admin = User.objects.create(email='topic-admin@example.com', role='admin')
        token, _ = SessionToken.issue(admin)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        self.subject = Subject.objects.create(title='Mathematics')

    def test_topic_is_created_for_the_supplied_subject(self):
        response = self.client.post('/api/topics/create/', {
            'title': 'Algebra',
            'subject': self.subject.id,
        }, format='json')

        self.assertEqual(response.status_code, 201)
        topic = Topic.objects.get(title='Algebra')
        self.assertEqual(topic.subject, self.subject)

    def test_topic_without_subject_returns_validation_error(self):
        response = self.client.post('/api/topics/create/', {
            'title': 'Algebra',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertIn('subject', response.data)
        self.assertFalse(Topic.objects.filter(title='Algebra').exists())

    def test_topic_accepts_multiple_ordered_videos(self):
        response = self.client.post('/api/topics/create/', {
            'title': 'Algebra',
            'subject': self.subject.id,
            'videos': [
                {'url': 'https://youtu.be/first-video', 'order': 1},
                {'url': 'https://youtu.be/second-video', 'order': 2},
            ],
        }, format='json')

        self.assertEqual(response.status_code, 201)
        topic = Topic.objects.get(title='Algebra')
        self.assertEqual(
            list(topic.videos.values_list('url', flat=True)),
            ['https://youtu.be/first-video', 'https://youtu.be/second-video'],
        )
        self.assertEqual(response.data['youtube_url'], 'https://youtu.be/first-video')
        self.assertEqual(len(response.data['videos']), 2)

    def test_legacy_video_url_is_copied_into_video_collection(self):
        response = self.client.post('/api/topics/create/', {
            'title': 'Algebra',
            'subject': self.subject.id,
            'youtube_url': 'https://youtu.be/legacy-video',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        topic = Topic.objects.get(title='Algebra')
        self.assertEqual(topic.videos.get().url, topic.youtube_url)

    def test_topic_update_replaces_and_orders_videos(self):
        topic = Topic.objects.create(subject=self.subject, title='Algebra')
        first = TopicVideo.objects.create(topic=topic, url='https://youtu.be/old-first', order=1)
        TopicVideo.objects.create(topic=topic, url='https://youtu.be/old-second', order=2)

        response = self.client.put(f'/api/topics/manage/{topic.id}/', {
            'title': topic.title,
            'subject': self.subject.id,
            'videos': [
                {'id': first.id, 'url': 'https://youtu.be/updated', 'order': 1},
                {'url': 'https://youtu.be/added', 'order': 2},
            ],
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            list(topic.videos.values_list('url', flat=True)),
            ['https://youtu.be/updated', 'https://youtu.be/added'],
        )
        self.assertEqual(Topic.objects.get(id=topic.id).youtube_url, 'https://youtu.be/updated')


@override_settings(EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend')
class CreateUserEmailTests(TestCase):
    def setUp(self):
        admin = User.objects.create(email='admin@example.com', role='admin')
        token, _ = SessionToken.issue(admin)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_access_code_email_uses_the_header_icon_without_attachments(self):
        sent_messages = []

        def capture_email(message, fail_silently=False):
            sent_messages.append(message)
            return 1

        with patch('core.models.EmailMultiAlternatives.send', new=capture_email):
            User.objects.create(email='student@example.com').generate_code()

        html_content = sent_messages[0].alternatives[0][0]
        self.assertNotIn('cid:', html_content)
        self.assertNotIn('<img', html_content)
        self.assertIn('&#x2699;&#xFE0E;', html_content)
        self.assertIn('Learn Engineering', html_content)
        self.assertEqual(sent_messages[0].attachments, [])

    @patch('core.models.EmailMultiAlternatives.send', side_effect=AnymailUnsupportedFeature('Brevo does not support inline attachments'))
    def test_email_provider_errors_are_reported_as_delivery_errors(self, send_email):
        user = User.objects.create(email='student@example.com')

        with self.assertRaises(EmailDeliveryError):
            user.generate_code()

    @patch('core.models.EmailMultiAlternatives.send', side_effect=OSError('SMTP unavailable'))
    def test_email_delivery_error_rolls_back_new_account(self, send_email):
        response = self.client.post('/api/users/create/', {
            'userName': 'New Student',
            'email': 'student@example.com',
        }, format='json')

        self.assertEqual(response.status_code, 503)
        self.assertFalse(User.objects.filter(email='student@example.com').exists())

    @patch('core.models.EmailMultiAlternatives.send', return_value=0)
    def test_email_not_accepted_rolls_back_new_account(self, send_email):
        response = self.client.post('/api/users/create/', {
            'userName': 'New Student',
            'email': 'student@example.com',
        }, format='json')

        self.assertEqual(response.status_code, 503)
        self.assertFalse(User.objects.filter(email='student@example.com').exists())

    @patch('core.models.EmailMultiAlternatives.send', return_value=1)
    def test_account_is_created_when_email_is_accepted(self, send_email):
        response = self.client.post('/api/users/create/', {
            'userName': 'New Student',
            'email': 'student@example.com',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email='student@example.com').exists())

    @patch('core.models.EmailMultiAlternatives.send', return_value=1)
    def test_selected_admin_role_is_saved_when_creating_user(self, send_email):
        response = self.client.post('/api/users/create/', {
            'userName': 'New Admin',
            'email': 'new-admin@example.com',
            'role': 'admin',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            User.objects.get(email='new-admin@example.com').role,
            'admin',
        )

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.console.EmailBackend')
    def test_console_backend_does_not_create_account(self):
        response = self.client.post('/api/users/create/', {
            'userName': 'New Student',
            'email': 'student@example.com',
        }, format='json')

        self.assertEqual(response.status_code, 503)
        self.assertFalse(User.objects.filter(email='student@example.com').exists())

    @patch('core.models.EmailMultiAlternatives.send', side_effect=OSError('SMTP unavailable'))
    def test_forgot_code_failure_keeps_previous_code(self, send_email):
        user = User.objects.create(
            email='student@example.com',
            codePass=make_password('PREVIOUS1'),
        )

        response = self.client.post('/api/forgot-code/', {
            'email': user.email,
        }, format='json')

        user.refresh_from_db()
        self.assertEqual(response.status_code, 503)
        self.assertTrue(check_password('PREVIOUS1', user.codePass))
