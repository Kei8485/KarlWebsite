from unittest.mock import patch

from django.contrib.auth.hashers import check_password, make_password
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import SessionToken, User


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
