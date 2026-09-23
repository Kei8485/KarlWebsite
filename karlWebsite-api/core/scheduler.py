from apscheduler.schedulers.background import BackgroundScheduler
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from .models import ScheduledStudy

def send_scheduled_emails():
    # Find all scheduled studies where the time has passed and we haven't sent the email yet
    now = timezone.now()
    due_studies = ScheduledStudy.objects.filter(scheduled_time__lte=now, is_sent=False)
    
    for study in due_studies:
        user = study.user
        
        # Format the email
        subject = f"Reminder: Time to study {study.subject or study.title}!"
        from_email = settings.DEFAULT_FROM_EMAIL
        to = [user.email]
        text_content = f"Hey!\n\nIt's time to study {study.title} ({study.subject}). Get to work!"
        
        html_content = f"""
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
                        <span style="color:#fff;font-size:18px;font-weight:700;">ApexEng Planner</span>
                      </td>
                    </tr></table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px;">
                    <h1 style="color:#fff;font-size:28px;font-weight:700;margin:0 0 16px 0;">Time to study!</h1>
                    <p style="color:#94a3b8;font-size:15px;margin:0 0 32px 0;">You scheduled a study session for right now.</p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                      <tr>
                        <td style="background-color:#1e293b;border:1px solid #334155;border-radius:10px;padding:24px;text-align:center;">
                          <p style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px 0;">{study.subject or "Topic"}</p>
                          <p style="color:#2563eb;font-size:24px;font-weight:700;margin:0;">{study.title}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """
        
        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        
        # Mark as sent so we don't send it again
        study.is_sent = True
        study.save()
        
        print(f"Sent scheduled study email to {user.email} for {study.title}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    # Run this check every 1 minute
    scheduler.add_job(send_scheduled_emails, 'interval', minutes=1)
    scheduler.start()
    print("Background Email Scheduler Started!")
