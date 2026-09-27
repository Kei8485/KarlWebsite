import json
import logging
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend


logger = logging.getLogger(__name__)


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
