from django.db import models

import secrets
import string
import hashlib
import logging
import smtplib
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from django.core.mail import EmailMultiAlternatives, get_connection
from django.core.mail.backends.console import EmailBackend as ConsoleEmailBackend
from django.conf import settings
from django.db import transaction
from anymail.exceptions import AnymailError


logger = logging.getLogger(__name__)


class EmailDeliveryError(Exception):
    pass


class User(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'), # ung una kung ano ididisplay sa data base tas ung pangalawa ididisplay sa UI
        ('admin', 'Admin'),
    ]
     
    email = models.EmailField(unique=True)
    userName= models.CharField(max_length=50, default='')
    codePass = models.CharField(max_length=128, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    created_at = models.DateTimeField(auto_now_add=True)
    
    @transaction.atomic
    def generate_code(self):
        # 1. Generate the code
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        self.codePass = make_password(code)
        self.save()
        
        # 2. Automatically send the email every time a code is generated!
        subject = 'Verification code and Your Password for EngiNear'
        from_email = settings.DEFAULT_FROM_EMAIL
        to = [self.email]
        text_content = f'Your access code is: {code}\n\nGo to the site and enter your email + this code to log in.'
        html_content = f'''
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="color-scheme" content="dark">
            <meta name="supported-color-schemes" content="dark">
            <style>
                a[x-apple-data-detectors] {{
                    color: inherit !important;
                    text-decoration: none !important;
                    font-size: inherit !important;
                    font-family: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                }}
            </style>
            </head>
            <body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 0;">
                <tr>
                <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border:1px solid #1e293b;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td style="padding:32px 40px 24px 40px;border-bottom:1px solid #1e293b;">
                        <table cellpadding="0" cellspacing="0">
                            <tr>
                            <td width="44" height="44" align="center" valign="middle" style="width:44px;height:44px;background-color:#2563eb;border-radius:8px;">
                                <span aria-hidden="true" style="color:#ffffff;font-family:Arial,sans-serif;font-size:27px;line-height:1;">&#x2699;&#xFE0E;</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 512 512" style="display:none;">
                                    <path d="M436.67 184.11a27.17 27.17 0 0 1-38.3 0l-22.48-22.49a27.15 27.15 0 0 1 0-38.29l50.89-50.89a.85.85 0 0 0-.26-1.38C393.68 57 351.09 64.15 324.05 91c-25.88 25.69-27.35 64.27-17.87 98a27 27 0 0 1-7.67 27.14l-173 160.76a40.76 40.76 0 1 0 57.57 57.54l162.15-173.3a27 27 0 0 1 26.77-7.7c33.46 8.94 71.49 7.26 97.07-17.94 27.49-27.08 33.42-74.94 20.1-102.33a.85.85 0 0 0-1.36-.22Z"/>
                                    <path d="M224 284c-17.48-17-25.49-24.91-31-30.29a18.24 18.24 0 0 1-3.33-21.35 20.8 20.8 0 0 1 3.5-4.62l15.68-15.29a18.7 18.7 0 0 1 5.63-3.87 18.11 18.11 0 0 1 20 3.62c5.45 5.29 15.43 15 33.41 32.52M317.07 291.3c40.95 38.1 90.62 83.27 110 99.41a13.46 13.46 0 0 1 .94 19.92L394.63 444a14 14 0 0 1-20.29-.76c-16.53-19.18-61.09-67.11-99.27-107"/>
                                    <path d="m17.34 193.5 29.41-28.74a4.7 4.7 0 0 1 3.41-1.35 4.85 4.85 0 0 1 3.41 1.35h0a9.86 9.86 0 0 0 8.19 2.77c3.83-.42 7.92-1.6 10.57-4.12 6-5.8-.94-17.23 4.34-24.54a207 207 0 0 1 19.78-22.6c6-5.88 29.84-28.32 69.9-44.45A107.3 107.3 0 0 1 206.67 64c22.59 0 40 10 46.26 15.67a89.5 89.5 0 0 1 10.28 11.64 79 79 0 0 0-9.21-2.77 68.8 68.8 0 0 0-20-1.26c-13.33 1.09-29.41 7.26-38 14-13.9 11-19.87 25.72-20.81 44.71-.68 14.12 2.72 22.1 36.1 55.49a6.6 6.6 0 0 1-.34 9.16l-18.22 18a6.88 6.88 0 0 1-9.54.09c-21.94-21.94-36.65-33.09-45-38.16s-15.07-6.5-18.3-6.85a30.85 30.85 0 0 0-18.27 3.87 11.4 11.4 0 0 0-2.64 2 14.14 14.14 0 0 0 .42 20.08l1.71 1.6a4.63 4.63 0 0 1 0 6.64L71.73 246.6a4.7 4.7 0 0 1-3.41 1.4 4.86 4.86 0 0 1-3.41-1.35l-47.57-46.43a4.88 4.88 0 0 1 0-6.72"/>
                            </td>
                            <td style="padding-left:12px;">
                                <span style="color:#ffffff;font-size:18px;font-weight:700;">Learn with EngiNear</span><br>
                                <span style="color:#64748b;font-size:11px;letter-spacing:1.5px;">Learn Engineering</span>
                            </td>
                            </tr>
                        </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px 40px 32px 40px;">
                        <p style="color:#94a3b8;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px 0;">Access Code</p>
                        <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0 0 16px 0;line-height:1.3;">
                            Your access code<br>is ready.
                        </h1>
                        <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 32px 0;">
                            Use your email address and the code below to log in to EngiNear and start learning.
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                            <tr>
                            <td style="background-color:#1e293b;border:1px solid #334155;border-radius:10px;padding:24px;text-align:center;">
                                <p style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px 0;">Your Code</p>
                                <!-- Notice self.codePass instead of obj.codePass -->
                                <p style="color:#2563eb;font-size:32px;font-weight:700;letter-spacing:8px;margin:0;font-family:monospace;">{code}</p>
                            </td>
                            </tr>
                        </table>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                            <tr>
                            <td align="center">
                                <a href="https://6enginear.netlify.app/login" style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
                                Start Learning →
                                </a>
                            </td>
                            </tr>
                        </table>
                        <p style="color:#475569;font-size:13px;line-height:1.6;margin:0;">
                            If you didn't expect this email, you can ignore it. This code is linked to <strong style="color:#64748b;">{self.email}</strong>.
                        </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 40px;border-top:1px solid #1e293b;">
                        <p style="color:#334155;font-size:12px;margin:0;text-align:center;">
                            © 2026 EngiNear Website · NEUST ENGINEERINGS
                        </p>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>
            </table>
            </body>
            </html>
        '''
        
        connection = get_connection()
        if isinstance(connection, ConsoleEmailBackend):
            logger.error('Email delivery is disabled: Django is using the console email backend.')
            raise EmailDeliveryError('The console email backend does not deliver email.')

        msg = EmailMultiAlternatives(subject, text_content, from_email, to, connection=connection)
        try:
            msg.attach_alternative(html_content, "text/html")
            if msg.send(fail_silently=False) != 1:
                logger.error('Email backend %s did not accept the access-code email.', settings.EMAIL_BACKEND)
                raise EmailDeliveryError('The email backend did not accept the message.')
        except (OSError, smtplib.SMTPException, AnymailError) as exc:
            smtp_code = getattr(exc, 'smtp_code', None)
            logger.error(
                'Access-code email failed using backend %s (%s%s).',
                settings.EMAIL_BACKEND,
                type(exc).__name__,
                f', SMTP status {smtp_code}' if smtp_code is not None else '',
                exc_info=True,
            )
            raise EmailDeliveryError('The email could not be sent.') from exc
    
    def __str__(self): # '__str__' (built-in function) for turning the obj into a string
        return self.email    
    
class Subject(models.Model): 
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True, null=True, default="MATHEMATICS")
    course_code = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return self.title
    

class Topic(models.Model): 
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='topics')
    title = models.CharField(max_length=100)
    notes = models.TextField(blank=True)
    # Kept for compatibility with existing clients; videos is the canonical collection.
    youtube_url = models.URLField(blank=True)
    order = models.IntegerField(default=0)
    
    
    class Meta: # meta is for setting a rule
        ordering = ['order']
    def __str__(self):
        return f"{self.subject.title} — {self.title}"


class TopicVideo(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='videos')
    url = models.URLField()
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.topic.title} — Part {self.order}"
    

class PlannerTask(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=100, blank=True, null=True)
    due_date = models.DateTimeField()
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        
        return f"{self.title} - {self.user.email}"
    
    
class StudySession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_sessions')
    duration_minutes = models.IntegerField() 
    created_at = models.DateTimeField(auto_now_add=True) 
    def __str__(self):
        # 🚨 Changed username to email here too!
        return f"{self.user.email} studied for {self.duration_minutes} mins"


class ScheduledStudy(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scheduled_studies')
    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=100, blank=True, null=True)
    scheduled_time = models.DateTimeField()
    is_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.user.email} at {self.scheduled_time}"

class QuizQuestion(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    
    CORRECT_CHOICES = [
        ('A', 'Option A'),
        ('B', 'Option B'),
        ('C', 'Option C'),
        ('D', 'Option D'),
    ]
    correct_option = models.CharField(max_length=1, choices=CORRECT_CHOICES)

    def __str__(self):
        return f"Question: {self.question_text[:50]}..."


class SessionToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='session_tokens')
    token_hash = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    @classmethod
    def issue(cls, user):
        raw = secrets.token_urlsafe(32)
        token = cls.objects.create(
            user=user,
            token_hash=hashlib.sha256(raw.encode()).hexdigest(),
            expires_at=timezone.now() + timedelta(days=7),
        )
        return raw, token