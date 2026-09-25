from django.db import models

import secrets
import string
import hashlib
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

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
    
    def generate_code(self):
        # 1. Generate the code
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        self.codePass = make_password(code)
        self.save()
        
        # 2. Automatically send the email every time a code is generated!
        subject = 'Website ni Karl Try Try'
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
                            <td style="background-color:#2563eb;border-radius:8px;padding:8px 12px;margin-right:12px;">
                                <span style="color:#ffffff;font-size:14px;font-weight:700;letter-spacing:1px;">AE</span>
                            </td>
                            <td style="padding-left:12px;">
                                <span style="color:#ffffff;font-size:18px;font-weight:700;">Karl Website Try</span><br>
                                <span style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Apex Engineering</span>
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
                            Use your email address and the code below to log in to ApexEng and start learning.
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
                                <a href="#" style="display:inline-block;background-color:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;">
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
                            © 2026 THE KARL WEB · NEUST ENGINEERINGS
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
        
        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send()
    
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
    youtube_url = models.URLField(blank=True)
    order = models.IntegerField(default=0)
    
    
    class Meta: # meta is for setting a rule
        ordering = ['order']
    def __str__(self):
        return f"{self.subject.title} — {self.title}"
    

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