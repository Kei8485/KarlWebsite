from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from .models import Subject, Topic, User
from .serializers import SubjectSerializer, TopicSerializer

@api_view(['GET'])
def get_subjects(request):
    subjects = Subject.objects.all()
    serializer = SubjectSerializer(subjects, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_subject_topics(request, subject_id):
    try:
        subject = Subject.objects.get(id=subject_id)
    except Subject.DoesNotExist:
        return Response({'error': 'Subject not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = SubjectSerializer(subject)
    return Response(serializer.data) # Since API na ung ginagawa ko dapat Response() gagamitin para ireturn

@api_view(['GET'])
def get_topic(request, topic_id):
    try:
        topic = Topic.objects.get(id=topic_id)
    except Topic.DoesNotExist:
        return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = TopicSerializer(topic)
    return Response(serializer.data)

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    code = request.data.get('code')
    try:
        user = User.objects.get(email=email, codePass=code)
        return Response({'success': True, 'role': user.role})
    except User.DoesNotExist:
        return Response({'error': 'Invalid email or code'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def forgot_code(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        user.generate_code()

        text_content = f'Your new access code is: {user.codePass}'
        html_content = f'''
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border:1px solid #1e293b;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:32px 40px 24px 40px;border-bottom:1px solid #1e293b;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="background-color:#2563eb;border-radius:8px;padding:8px 12px;">
                <span style="color:#fff;font-size:14px;font-weight:700;">AE</span>
              </td>
              <td style="padding-left:12px;">
                <span style="color:#fff;font-size:18px;font-weight:700;">ApexEng</span><br>
                <span style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Apex Engineering</span>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="color:#94a3b8;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px 0;">New Access Code</p>
            <h1 style="color:#fff;font-size:28px;font-weight:700;margin:0 0 16px 0;">Your new code<br>is ready.</h1>
            <p style="color:#94a3b8;font-size:15px;margin:0 0 32px 0;">Here is your new access code. Your old code is no longer valid.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background-color:#1e293b;border:1px solid #334155;border-radius:10px;padding:24px;text-align:center;">
                  <p style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px 0;">Your Code</p>
                  <p style="color:#2563eb;font-size:32px;font-weight:700;letter-spacing:8px;margin:0;font-family:monospace;">{user.codePass}</p>
                </td>
              </tr>
            </table>
            <p style="color:#475569;font-size:13px;margin:0;">This code is linked to <strong style="color:#64748b;">{user.email}</strong>.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #1e293b;">
            <p style="color:#334155;font-size:12px;margin:0;text-align:center;">© 2026 ApexEng · Apex Engineering</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
'''
        msg = EmailMultiAlternatives('Your New ApexEng Access Code', text_content, settings.DEFAULT_FROM_EMAIL, [user.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        return Response({'success': True})
    except User.DoesNotExist:
        return Response({'error': 'Email not found'}, status=status.HTTP_404_NOT_FOUND)