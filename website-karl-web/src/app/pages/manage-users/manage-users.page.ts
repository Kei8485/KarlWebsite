import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonContent, IonIcon, IonSelect, IonSelectOption, ModalController } from '@ionic/angular'; // 🚨 Swapped to ModalController
import { AppHeaderComponent } from '../../components/organisms/app-header/app-header.component';
import { AppButtonComponent } from '../../components/atoms/app-button/app-button.component';
import { addIcons } from 'ionicons';
import { trashOutline, personAddOutline } from 'ionicons/icons';

// 🚨 Import your new custom modal! (Adjust path if needed based on your folder structure)
import { ConfirmModalComponent } from '../../components/molecules/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.page.html',
  styleUrls: ['./manage-users.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonSelect, IonSelectOption, CommonModule, FormsModule, AppHeaderComponent, AppButtonComponent]
})
export class ManageUsersPage implements OnInit, OnDestroy  {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/users'; 
  private cdr = inject(ChangeDetectorRef); 
  private modalCtrl = inject(ModalController); // 🚨 Injected ModalController

  users: any[] = [];
  filteredUsers: any[] = [];
  currentFilter: string = 'all';
  errorMessage: string = '';
  successMessage: string = '';

  refreshTimer: any;

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
    this.refreshTimer = setInterval(() => {
      this.loadUsers();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }
  
  loadUsers() {
    this.http.get<any[]>(`${this.apiUrl}/`).subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilter(this.currentFilter); 
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error loading users:', err)
    });
  }

  applyFilter(filterType: string) {
    this.currentFilter = filterType;
    let temp = [...this.users];

    if (filterType !== 'all') {
      temp = temp.filter(u => u.role === filterType);
    }

    this.filteredUsers = temp.sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (a.role !== 'admin' && b.role === 'admin') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  // 🚨 Open Blue Custom Modal for Creating
  async addUser() {
    this.errorMessage = ''; 
    this.successMessage = ''; 

    if (!this.newUser.userName || !this.newUser.email) return;

    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal', // Uses the CSS class we put in global.scss!
      componentProps: {
        title: 'Confirm Creation',
        message: `Are you sure you want to create an account for <strong>${this.newUser.userName}</strong>?`,
        confirmText: 'Create User',
        isDanger: false // Keeps it blue
      }
    });
    
    await modal.present();

    // Wait for the modal to close and check what the user clicked
    const { data } = await modal.onWillDismiss();
    if (data === true) {
      this.executeAddUser();
    }
  }

  private executeAddUser() {
    this.http.post(`${this.apiUrl}/create/`, this.newUser).subscribe({
      next: () => {
        this.loadUsers(); 
        this.newUser = { userName: '', email: '', role: 'student' }; 
        this.successMessage = "User successfully created!";
        this.cdr.detectChanges(); 
        
        setTimeout(() => { 
          this.successMessage = ''; 
          this.cdr.detectChanges(); 
        }, 3000);
      },
      error: (err) => {
        if (err.error && err.error.email) {
          this.errorMessage = "This email is already registered!";
        } else {
          this.errorMessage = "Failed to create user. Please try again.";
        }
        this.cdr.detectChanges(); 
      }
    });
  }

  // 🚨 Open Red Custom Modal for Deleting
  async deleteUser(id: number) {
    const targetUser = this.users.find(u => u.id === id);
    const nameToDisplay = targetUser ? targetUser.userName : 'this user';

    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: 'Delete Account?',
        message: `Are you sure you want to permanently delete <strong>${nameToDisplay}</strong>? This cannot be undone.`,
        confirmText: 'Delete',
        isDanger: true // Turns the modal danger colors on!
      }
    });
    
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data === true) {
      this.executeDeleteUser(id);
    }
  }

  private executeDeleteUser(id: number) {
    this.http.delete(`${this.apiUrl}/delete/${id}/`).subscribe({
      next: () => {
        this.loadUsers();
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error deleting user:', err)
    });
  }
}