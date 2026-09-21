from django.contrib import admin
from .models import User, Subject, Topic

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