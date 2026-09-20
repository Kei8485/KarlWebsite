from django.db import models

import random # libraries na kailangan 
import string

# Create your models here.

class User(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'), # ung una kung ano ididisplay sa data base tas ung pangalawa ididisplay sa UI
        ('admin', 'Admin'),
    ]
     
    email = models.EmailField(unique=True)
    userName= models.CharField(max_length=50, default='')
    codePass = models.CharField(max_length=16, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def generate_code(self):
        self.codePass = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        self.save()
    
    def __str__(self): # '__str__' (built-in function) for turning the obj into a string
        return self.email    
    
class Subject(models.Model): 
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
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
    
