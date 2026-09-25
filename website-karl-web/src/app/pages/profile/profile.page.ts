import { environment } from '../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, ModalController, ToastController } from '@ionic/angular';
import { ConfirmModalComponent } from '../../components/molecules/confirm-modal/confirm-modal.component';
import { HttpClient } from '@angular/common/http';
import { AppHeaderComponent } from '../../components/organisms/app-header/app-header.component';
import { AppButtonComponent } from '../../components/atoms/app-button/app-button.component';
import { addIcons } from 'ionicons';
import { saveOutline, personCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, AppHeaderComponent, AppButtonComponent]
})
export class ProfilePage implements OnInit {
  userId: string | null = null;
  userEmail: string = '';
  userName: string = '';
  codePass: string = '';
  confirmCodePass: string = '';

  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  
  apiSystemUrl = environment.apiUrl;

  constructor(private http: HttpClient, private modalCtrl: ModalController, private toastCtrl: ToastController) {
    addIcons({ saveOutline, personCircleOutline, checkmarkCircleOutline });
  }

  ngOnInit() {
    this.userId = localStorage.getItem('userId');
    this.userEmail = localStorage.getItem('email') || '';
    this.userName = localStorage.getItem('userName') || '';
  }

  async saveProfile() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.userName.trim()) {
      this.errorMessage = 'Name cannot be empty.';
      return;
    }

    if (this.codePass || this.confirmCodePass) {
      if (this.codePass !== this.confirmCodePass) {
        this.errorMessage = 'Passwords do not match.';
        return;
      }
      if (this.codePass.length < 6) {
        this.errorMessage = 'Password must be at least 6 characters long.';
        return;
      }
    }

    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: 'Save Changes?',
        message: 'Are you sure you want to update your profile information?',
        confirmText: 'Save',
        isDanger: false
      }
    });
    
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data === true) {
      this.isLoading = true;
      
      const payload: any = {
        userName: this.userName
      };
      if (this.codePass) {
        payload.codePass = this.codePass;
      }

      this.http.put(`${this.apiSystemUrl}/users/${this.userId}/update/`, payload).subscribe({
        next: async (res: any) => {
          this.isLoading = false;
          localStorage.setItem('userName', res.userName);
          this.codePass = '';
          this.confirmCodePass = '';
          
          const toast = await this.toastCtrl.create({
            message: 'Profile updated successfully!',
            duration: 3000,
            position: 'middle',
            icon: 'checkmark-circle-outline',
            cssClass: 'karl-toast'
          });
          await toast.present();
          
          window.dispatchEvent(new CustomEvent('profile-updated'));
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'An error occurred while updating profile.';
        }
      });
    }
  }
}
