import base64
import json
import logging
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend


logger = logging.getLogger(__name__)


class GmailApiEmailBackend(BaseEmailBackend):
    token_url = 'https://oauth2.googleapis.com/token'
    send_url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.client_id = settings.GMAIL_OAUTH_CLIENT_ID
        self.client_secret = settings.GMAIL_OAUTH_CLIENT_SECRET
        self.refresh_token = settings.GMAIL_OAUTH_REFRESH_TOKEN
        self.timeout = settings.GMAIL_API_TIMEOUT

    def send_messages(self, email_messages):
        if not email_messages:
            return 0
        if not all((self.client_id, self.client_secret, self.refresh_token)):
            raise OSError('Gmail API OAuth credentials are not configured.')

        try:
            access_token = self._get_access_token()
            for message in email_messages:
                self._send_message(message, access_token)
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            status_code = exc.code if isinstance(exc, HTTPError) else None
            logger.error(
                'Gmail API request failed (%s%s).',
                type(exc).__name__,
                f', HTTP status {status_code}' if status_code is not None else '',
            )
            if not self.fail_silently:
                raise OSError('Email delivery through the Gmail API failed.') from exc
            return 0

        return len(email_messages)

    def _get_access_token(self):
        request = Request(
            self.token_url,
            data=urlencode({
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'refresh_token': self.refresh_token,
                'grant_type': 'refresh_token',
            }).encode('utf-8'),
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            method='POST',
        )
        with urlopen(request, timeout=self.timeout) as response:
            try:
                token_data = json.loads(response.read().decode('utf-8'))
            except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                raise OSError('Google OAuth returned an invalid token response.') from exc

        access_token = token_data.get('access_token')
        if not access_token:
            raise OSError('Google OAuth response did not include an access token.')
        return access_token

    def _send_message(self, message, access_token):
        raw_message = base64.urlsafe_b64encode(
            message.message().as_bytes()
        ).decode('ascii')
        request = Request(
            self.send_url,
            data=json.dumps({'raw': raw_message}).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json',
            },
            method='POST',
        )
        with urlopen(request, timeout=self.timeout):
            pass


class ResendEmailBackend(BaseEmailBackend):
    api_url = 'https://api.resend.com/emails'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.api_key = settings.RESEND_API_KEY
        self.timeout = settings.RESEND_API_TIMEOUT

    def send_messages(self, email_messages):
        if not email_messages:
            return 0
        if not self.api_key:
            raise OSError('Resend API key is not configured.')

        sent_count = 0
        for message in email_messages:
            try:
                self._send_message(message)
                sent_count += 1
            except (HTTPError, URLError, TimeoutError, OSError) as exc:
                status_code = exc.code if isinstance(exc, HTTPError) else None
                logger.error(
                    'Resend email request failed (%s%s).',
                    type(exc).__name__,
                    f', HTTP status {status_code}' if status_code is not None else '',
                )
                if not self.fail_silently:
                    raise OSError('Email delivery through Resend failed.') from exc

        return sent_count

    def _send_message(self, message):
        payload = {
            'from': message.from_email,
            'to': message.to,
            'subject': message.subject,
            'text': message.body,
        }

        html_alternative = next(
            (
                alternative.content
                for alternative in message.alternatives
                if alternative.mimetype == 'text/html'
            ),
            None,
        )
        if html_alternative is not None:
            payload['html'] = html_alternative
        if message.cc:
            payload['cc'] = message.cc
        if message.bcc:
            payload['bcc'] = message.bcc
        if message.reply_to:
            payload['reply_to'] = message.reply_to

        request = Request(
            self.api_url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            },
            method='POST',
        )
        with urlopen(request, timeout=self.timeout):
            pass
