from django.contrib import admin
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from .models import User, Subject, Topic


@admin.register(User) # for connecting this function and the userAdmin class
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'userName' ,'email', 'codePass', 'role', 'created_at'] # ung asa datamodel
    readonly_fields = ['codePass', 'created_at']
    def save_model(self, request, obj, form, change): # kasama sa library, pang add ng bagong user
        #request - http request
        #obj - the model being save
        #change - kung may nangyari
        #ooverride to
        if not change:  # only when adding a new user, not editing
            obj.generate_code()  # generates and saves the code
            subject = 'Website ni Karl Try Try'
            from_email = settings.DEFAULT_FROM_EMAIL
            to = [obj.email]
            text_content = f'Your access code is: {obj.codePass}\n\nGo to the site and enter your email + this code to log in.'
            html_content = f'''
                <!DOCTYPE html>
                <html>
                                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                
                <!-- FORCE DARK MODE ONLY -->
                <meta name="color-scheme" content="dark">
                <meta name="supported-color-schemes" content="dark">
                
                <style>
                    /* Forces Apple Mail to stop auto-coloring text and links */
                    a[x-apple-data-detectors] {
                        color: inherit !important;
                        text-decoration: none !important;
                        font-size: inherit !important;
                        font-family: inherit !important;
                        font-weight: inherit !important;
                        line-height: inherit !important;
                    }
                </style>
                </head>
                <body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 0;">
                    <tr>
                    <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border:1px solid #1e293b;border-radius:12px;overflow:hidden;">
                        
                        <!-- Header -->
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
                        <!-- Body -->
                        <tr>
                            <td style="padding:40px 40px 32px 40px;">
                            <p style="color:#94a3b8;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px 0;">Access Code</p>
                            <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0 0 16px 0;line-height:1.3;">
                                Your access code<br>is ready.
                            </h1>
                            <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 32px 0;">
                                Use your email address and the code below to log in to ApexEng and start learning.
                            </p>
                            <!-- Code Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                                <tr>
                                <td style="background-color:#1e293b;border:1px solid #334155;border-radius:10px;padding:24px;text-align:center;">
                                    <p style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px 0;">Your Code</p>
                                    <p style="color:#2563eb;font-size:32px;font-weight:700;letter-spacing:8px;margin:0;font-family:monospace;">{obj.codePass}</p>
                                </td>
                                </tr>
                            </table>
                            <!-- CTA Button -->
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
                                If you didn't expect this email, you can ignore it. This code is linked to <strong style="color:#64748b;">{obj.email}</strong>.
                            </p>
                            </td>
                        </tr>
                        <!-- Footer -->
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
        else:
            obj.save()
            

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'description']
                


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['id','title', 'subject', 'order']
    list_filter = ['subject']
