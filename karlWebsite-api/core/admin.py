from django.contrib import admin
from .models import User, Subject, Topic, PlannerTask, StudySession, ScheduledStudy

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'userName' ,'email', 'codePass', 'role', 'created_at'] 
    readonly_fields = ['codePass', 'created_at']
    
    def save_model(self, request, obj, form, change):
        if not change:  # only when adding a new user
            obj.generate_code() # <--- This now automatically generates the code AND sends the email!
        else:
            obj.save()

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'description']

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['id','title', 'subject', 'order']
    list_filter = ['subject']
    
    
admin.site.register(PlannerTask)
admin.site.register(StudySession)

@admin.register(ScheduledStudy)
class ScheduledStudyAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'scheduled_time', 'is_sent']
    list_filter = ['is_sent', 'scheduled_time']