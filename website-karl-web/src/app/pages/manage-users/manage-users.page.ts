import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonContent, IonIcon, IonSelect, IonSelectOption } from '@ionic/angular';import { AppHeaderComponent } from '../../components/organisms/app-header/app-header.component';
import { AppButtonComponent } from '../../components/atoms/app-button/app-button.component';
import { addIcons } from 'ionicons';
import { trashOutline, personAddOutline } from 'ionicons/icons';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.page.html',
  styleUrls: ['./manage-users.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonSelect, IonSelectOption, CommonModule, FormsModule, AppHeaderComponent, AppButtonComponent]
})
export class ManageUsersPage implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/users'; // Adjust to your Django URL
  private cdr = inject(ChangeDetectorRef); 

  users: any[] = [];
  filteredUsers: any[] = [];
  currentFilter: string = 'all';
  errorMessage: string = '';
  successMessage: string = '';

  newUser = {
    userName: '',
    email: '',
    role: 'student'
  };

  constructor() {
    addIcons({ trashOutline, personAddOutline });
  }

  ngOnInit() {
    this.loadUsers();
  }

  // 1. Fetch from Django
  loadUsers() {
    this.http.get<any[]>(`${this.apiUrl}/`).subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilter(this.currentFilter); // Filters and sorts
        
        this.cdr.detectChanges(); // 🚨 Forces the screen to show them instantly on page load!
      },
      error: (err) => console.error('Error loading users:', err)
    });
  }

  // 2. Filter & Sort (Admins on Top!)
  applyFilter(filterType: string) {
    this.currentFilter = filterType;
    let temp = [...this.users];

    // Filter by role if needed
    if (filterType !== 'all') {
      temp = temp.filter(u => u.role === filterType);
    }

    // Sort: Admins always first, then by date created
    this.filteredUsers = temp.sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (a.role !== 'admin' && b.role === 'admin') return 1;
      
      // If they are the same role, sort by newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  // 3. Send to Django
    addUser() {
    this.errorMessage = ''; 
    this.successMessage = ''; 

    if (!this.newUser.userName || !this.newUser.email) return;
    
    this.http.post(`${this.apiUrl}/create/`, this.newUser).subscribe({
      next: () => {
        this.loadUsers(); 
        this.newUser = { userName: '', email: '', role: 'student' }; 
        
        this.successMessage = "User successfully created!";
        this.cdr.detectChanges(); // 🚨 Forces instant screen refresh!
        
        setTimeout(() => { 
          this.successMessage = ''; 
          this.cdr.detectChanges(); // Forces refresh when message disappears
        }, 3000);
      },
      error: (err) => {
        if (err.error && err.error.email) {
          this.errorMessage = "This email is already registered!";
        } else {
          this.errorMessage = "Failed to create user. Please try again.";
        }
        
        this.cdr.detectChanges(); // 🚨 Forces instant screen refresh so the box turns red instantly!
      }
    });
  }

  // 4. Delete in Django
  deleteUser(id: number) {
    this.http.delete(`${this.apiUrl}/delete/${id}/`).subscribe({
      next: () => {
        this.loadUsers();
        this.cdr.detectChanges(); // 🚨 Forces the screen to update instantly
      },
      error: (err) => console.error('Error deleting user:', err)
    });
  }
}