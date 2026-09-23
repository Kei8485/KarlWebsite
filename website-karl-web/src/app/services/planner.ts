import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlannerService {
  private http = inject(HttpClient);
  
  // 🚨 Make sure this matches your Django URL!
  private apiUrl = 'http://127.0.0.1:8000/api'; 

  // ==========================================
  // 1. MANAGE TASKS
  // ==========================================
  
  updateTask(taskId: number, taskData: any) {
    return this.http.put(`${this.apiUrl}/tasks/${taskId}/`, taskData);
  }

  getTasks(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}/tasks/`);
  }

  addTask(userId: number, taskData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/tasks/`, taskData);
  }

  toggleTaskComplete(taskId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/tasks/${taskId}/`, {});
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tasks/${taskId}/`);
  }

  // ==========================================
  // 2. STUDY TIMER STATS
  // ==========================================
  
  saveStudySession(userId: number, durationMinutes: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/study-sessions/`, { 
      duration_minutes: durationMinutes 
    });
  }

  getWeeklyStats(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}/study-sessions/`);
  }
}