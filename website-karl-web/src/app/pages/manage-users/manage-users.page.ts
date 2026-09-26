import { environment } from '../../../environments/environment';
import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonSelect, IonSelectOption, IonSpinner, ModalController } from '@ionic/angular';
import { AppHeaderComponent } from '../../components/organisms/app-header/app-header.component';
import { AppButtonComponent } from '../../components/atoms/app-button/app-button.component';
import { addIcons } from 'ionicons';
import { trashOutline, personAddOutline, saveOutline, pencilOutline, addOutline, bookOutline } from 'ionicons/icons';

import { ConfirmModalComponent } from '../../components/molecules/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.page.html',
  styleUrls: ['./manage-users.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonSelect, IonSelectOption, IonSpinner, CommonModule, FormsModule, AppButtonComponent]
})
export class ManageUsersPage implements OnInit, OnDestroy  {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;
  private cdr = inject(ChangeDetectorRef); 
  private modalCtrl = inject(ModalController);
  private router = inject(Router); 

  users: any[] = [];
  filteredUsers: any[] = [];
  currentFilter: string = 'all';
  searchQuery: string = '';
  viewMode: 'users' | 'system' = 'users';
  cmsTab: 'info' | 'topics' = 'info';
  showQuizEditor: boolean = false;

  // CMS State
  apiSystemUrl = environment.apiUrl;
  subjectsList: any[] = [];
  activeSubject: any = null;
  expandedTopicId: number | null = null;

  setViewMode(mode: 'users' | 'system') {
    this.viewMode = mode;
  }
  
  errorMessage: string = '';
  successMessage: string = '';
  deleteUserErrorMessage: string = '';
  cmsErrorMessage: string = '';
  crudLoading: string | null = null;

  refreshTimer: any;

  newUser = {
    userName: '',
    email: '',
    role: 'student'
  };

  constructor() {
    addIcons({ trashOutline, personAddOutline, saveOutline, pencilOutline, addOutline, bookOutline });
  }

  ionViewWillEnter() { this.loadSubjects(); }

  ngOnInit() {
    this.loadUsers();
    this.loadSubjects();
    this.refreshTimer = setInterval(() => {
      this.loadUsers();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  onSearchChange(event: any) {
    // Simple placeholder to prevent compile errors
    // You can implement actual search filtering here later
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

  async addUser() {
    this.errorMessage = ''; 
    this.successMessage = ''; 

    if (!this.newUser.userName || !this.newUser.email) return;

    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: 'Confirm Creation',
        message: `Are you sure you want to create an account for <strong>${this.newUser.userName}</strong>?`,
        confirmText: 'Create User',
        isDanger: false
      }
    });
    
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data === true) {
      this.executeAddUser();
    }
  }

  private executeAddUser() {
    if (this.crudLoading) return;
    this.crudLoading = 'create-user';
    this.http.post(`${this.apiUrl}/create/`, this.newUser)
      .pipe(finalize(() => {
        this.crudLoading = null;
        this.cdr.detectChanges();
      }))
      .subscribe({
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
        } else if (typeof err.error?.error === 'string') {
          this.errorMessage = err.error.error;
        } else {
          this.errorMessage = "Failed to create user. Please try again.";
        }
        this.cdr.detectChanges(); 
      },
    });
  }

  async deleteUser(id: number) {
    if (this.crudLoading) return;
    const targetUser = this.users.find(u => u.id === id);
    const nameToDisplay = targetUser ? targetUser.userName : 'this user';

    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: 'Delete Account?',
        message: `Are you sure you want to permanently delete <strong>${nameToDisplay}</strong>? This cannot be undone.`,
        confirmText: 'Delete',
        isDanger: true 
      }
    });
    
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data === true) {
      this.executeDeleteUser(id);
    }
  }

  private executeDeleteUser(id: number) {
    if (this.crudLoading) return;
    this.deleteUserErrorMessage = '';
    this.crudLoading = `delete-user-${id}`;
    this.http.delete(`${this.apiUrl}/delete/${id}/`)
      .pipe(finalize(() => {
        this.crudLoading = null;
        this.cdr.detectChanges();
      }))
      .subscribe({
      next: () => {
        this.loadUsers();
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.deleteUserErrorMessage = err.error?.error || 'Could not delete the user. Please try again.';
        console.error('Error deleting user:', err);
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // CMS: SUBJECT MANAGEMENT
  // ==========================================
  loadSubjects() {
    this.http.get<any[]>(`${this.apiSystemUrl}/subjects/`).subscribe({
      next: (data) => {
        this.subjectsList = data;
        if (this.activeSubject) {
           // Refresh active subject data
           this.activeSubject = this.subjectsList.find(s => s.id === this.activeSubject.id) || null;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading subjects:', err)
    });
  }

  selectSubject(subject: any) {
    if (this.crudLoading) return;
    // Deep clone to avoid mutating the list until saved
    this.activeSubject = JSON.parse(JSON.stringify(subject));
    this.cmsTab = 'info';
  }

  addNewSubject() {
    if (this.crudLoading) return;
    this.activeSubject = {
      title: '',
      description: '',
      category: '',
      course_code: '',
      topics: []
    };
    this.cmsTab = 'info';
  }

  async saveSubject() {
    if (!this.activeSubject || this.crudLoading) return;

    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: 'Save Subject',
        message: `Are you sure you want to save changes to <strong>${this.activeSubject.title || 'this subject'}</strong>?`,
        confirmText: 'Save',
        isDanger: false
      }
    });
    
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data === true) {
      this.crudLoading = 'save-subject';
      this.cmsErrorMessage = '';
      if (this.activeSubject.id) {
        // Update existing
        this.http.put(`${this.apiSystemUrl}/subjects/manage/${this.activeSubject.id}/`, this.activeSubject)
          .pipe(finalize(() => {
            this.crudLoading = null;
            this.cdr.detectChanges();
          }))
          .subscribe({
          next: () => this.loadSubjects(),
          error: (err) => {
            this.cmsErrorMessage = err.error?.error || 'Could not save the subject. Please try again.';
            console.error('Error saving subject:', err);
          }
        });
      } else {
        // Create new
        this.http.post(`${this.apiSystemUrl}/subjects/create/`, this.activeSubject)
          .pipe(finalize(() => {
            this.crudLoading = null;
            this.cdr.detectChanges();
          }))
          .subscribe({
          next: (newSub: any) => {
            this.activeSubject = newSub;
            this.loadSubjects();
          },
          error: (err) => {
            this.cmsErrorMessage = err.error?.error || 'Could not create the subject. Please try again.';
            console.error('Error creating subject:', err);
          }
        });
      }
    }
  }

  async deleteSubject() {
    if (!this.activeSubject || !this.activeSubject.id || this.crudLoading) return;
    const subjectId = this.activeSubject.id;

    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: 'Delete Subject',
        message: `Are you sure you want to permanently delete <strong>${this.activeSubject.title}</strong>? All topics and quizzes inside it will be lost.`,
        confirmText: 'Delete',
        isDanger: true
      }
    });
    
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data === true) {
      this.crudLoading = 'delete-subject';
      this.cmsErrorMessage = '';
      this.http.delete(`${this.apiSystemUrl}/subjects/manage/${subjectId}/`)
        .pipe(finalize(() => {
          this.crudLoading = null;
          this.cdr.detectChanges();
        }))
        .subscribe({
        next: () => {
          this.activeSubject = null;
          this.loadSubjects();
        },
        error: (err) => {
          this.cmsErrorMessage = err.error?.error || 'Could not delete the subject. Please try again.';
          console.error('Error deleting subject:', err);
        }
      });
    }
  }

  
  goToAddTopic() {
    if (!this.activeSubject || !this.activeSubject.id || this.crudLoading) return;
    this.router.navigate(['/manage-topic', this.activeSubject.id, 'new']);
  }

  goToEditTopic(topicId: number) {
    if (!this.activeSubject || !this.activeSubject.id || this.crudLoading) return;
    this.router.navigate(['/manage-topic', this.activeSubject.id, topicId]);
  }
  
  async deleteTopic(topic: any) {
    if (this.crudLoading) return;
    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: 'Delete Topic',
        message: `Are you sure you want to permanently delete <strong>${topic.title}</strong>? All quizzes inside it will be lost.`,
        confirmText: 'Delete',
        isDanger: true
      }
    });
    
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data === true) {
      this.crudLoading = `delete-topic-${topic.id}`;
      this.cmsErrorMessage = '';
      this.http.delete(`${this.apiSystemUrl}/topics/manage/${topic.id}/`)
        .pipe(finalize(() => {
          this.crudLoading = null;
          this.cdr.detectChanges();
        }))
        .subscribe({
        next: () => this.loadSubjects(),
        error: (err) => {
          this.cmsErrorMessage = err.error?.error || 'Could not delete the topic. Please try again.';
          console.error('Error deleting topic:', err);
        }
      });
    }
  }

  toggleQuizEditor(topicId: number) {
    if (this.expandedTopicId === topicId) {
      this.expandedTopicId = null;
    } else {
      this.expandedTopicId = topicId;
    }
  }
}
