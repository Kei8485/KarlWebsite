import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { personOutline, keyOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';
import { IonContent, IonGrid, IonRow, IonCol, IonIcon, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';  
import { AppButtonComponent } from '../../components/atoms/app-button/app-button.component';
import { AppInputComponent } from '../../components/atoms/app-input/app-input.component';
import { AuthService } from '../../services/auth';
import { ForgotCodeModalComponent } from '../../components/molecules/forgot-code-modal/forgot-code-modal.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonContent, 
    IonGrid, 
    IonRow, 
    IonCol, 
    AppButtonComponent, 
    AppInputComponent,
  ]
})
export class LoginPage {
  email: string = '';
  accessCode: string = '';
  
  isLoading: boolean = false;
  loginError: string = '';
  isShaking: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController
  ) {
     addIcons({ personOutline, keyOutline, mailOutline, lockClosedOutline });
  }

  onLogin() {
    if (!this.email || !this.accessCode) {
      this.loginError = 'Please enter both email and access code.';
      this.isShaking = true;
      this.cdr.detectChanges(); 
      setTimeout(() => {
        this.isShaking = false;
        this.cdr.detectChanges(); 
      }, 500);
      return;
    }
    
    this.isLoading = true;
    this.loginError = '';
    this.authService.login(this.email, this.accessCode).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        localStorage.setItem('userId', response.id);
        localStorage.setItem('email', response.email);
        localStorage.setItem('userName', response.userName);
        localStorage.setItem('userRole', response.role);
        this.router.navigate(['/subjects']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.loginError = err.error?.error || 'Login failed. Please try again.';
        
        this.isShaking = true;
        this.cdr.detectChanges(); 

        setTimeout(() => {
          this.isShaking = false;
          this.cdr.detectChanges(); 
        }, 500);
      }
    });
  }

  async onForgot() {
    const modal = await this.modalCtrl.create({
      component: ForgotCodeModalComponent,
      cssClass: 'transparent-modal',
    });
    await modal.present();
  }
}