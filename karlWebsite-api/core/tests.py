import json
from unittest.mock import patch
from urllib.error import URLError

from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import EmailMultiAlternatives
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import EmailDeliveryError, SessionToken, Subject, Topic, User


@override_settings(
    EMAIL_BACKEND='core.email_backends.ResendEmailBackend',
    RESEND_API_KEY='re_test_key',
    RESEND_API_TIMEOUT=10,
    DEFAULT_FROM_EMAIL='ApexEng <onboarding@example.com>',
)
class ResendEmailBackendTests(TestCase):
    @patch('core.email_backends.urlopen')
    def test_sends_text_and_html_using_resend_api(self, mock_urlopen):
        response = mock_urlopen.return_value.__enter__.return_value
        response.read.return_value = b'{"id":"email_test_id"}'
        message = EmailMultiAlternatives(
            'Access code',
            'Your access code is ready.',
            to=['student@example.com'],
        )
        message.attach_alternative('<p>Your access code is ready.</p>', 'text/html')

        self.assertEqual(message.send(), 1)

        request = mock_urlopen.call_args.args[0]
        self.assertEqual(request.full_url, 'https://api.resend.com/emails')
        self.assertEqual(request.get_header('Authorization'), 'Bearer re_test_key')
        self.assertEqual(mock_urlopen.call_args.kwargs['timeout'], 10)
        self.assertEqual(json.loads(request.data), {
            'from': 'ApexEng <onboarding@example.com>',
            'to': ['student@example.com'],
            'subject': 'Access code',
            'text': 'Your access code is ready.',
            'html': '<p>Your access code is ready.</p>',
        })

    @patch('core.email_backends.urlopen', side_effect=URLError('connection failed'))
    def test_delivery_failure_preserves_existing_access_code(self, mock_urlopen):
        user = User.objects.create(
            email='student@example.com',
            codePass=make_password('PREVIOUS1'),
        )

        with self.assertRaises(EmailDeliveryError):
            user.generate_code()

        user.refresh_from_db()
        self.assertTrue(check_password('PREVIOUS1', user.codePass))


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

    def test_deployed_frontend_origin_receives_cors_header(self):
        response = self.client.get(
            '/api/subjects/',
            HTTP_ORIGIN='https://6enginear.netlify.app',
        )

        self.assertEqual(
            response['Access-Control-Allow-Origin'],
            'https://6enginear.netlify.app',
        )

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


@override_settings(EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend')
class CreateUserEmailTests(TestCase):
    def setUp(self):
        admin = User.objects.create(email='admin@example.com', role='admin')
        token, _ = SessionToken.issue(admin)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

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
