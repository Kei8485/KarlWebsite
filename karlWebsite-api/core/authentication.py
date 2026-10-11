import hashlib
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone
from .models import SessionToken


class BearerAuthentication(BaseAuthentication):
    def authenticate_header(self, request):
        return 'Bearer'

    def authenticate(self, request):
        header = request.headers.get('Authorization', '')
        if not header.startswith('Bearer '):
            return None
        raw = header[7:].strip()
        if not raw:
            raise AuthenticationFailed('Invalid token')
        now = timezone.now()
        try:
            session = SessionToken.objects.select_related('user').get(
                token_hash=hashlib.sha256(raw.encode()).hexdigest(),
                expires_at__gt=now,
            )
        except SessionToken.DoesNotExist:
            raise AuthenticationFailed('Invalid or expired token')
        session.expires_at = now + SessionToken.LIFETIME
        session.save(update_fields=['expires_at'])
        return (session.user, raw)


class IsAuthenticated:
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'is_authenticated', True))


class IsAdmin:
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'role', None) == 'admin')
