import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
// Consolidate all Ionic imports into one line from '@ionic/angular'
import { IonContent, IonGrid, IonRow, IonCol } from '@ionic/angular';
import { Router } from '@angular/router';  
import { AppButtonComponent } from '../../components/atoms/app-button/app-button.component';
import { AppInputComponent } from '../../components/atoms/app-input/app-input.component';
import { AuthService } from '../../services/auth';

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
    AppInputComponent
  ]
})
export class LoginPage {
  email: string = '';
  accessCode: string = '';
  
  // Variables to show loading spinner or error message
  isLoading: boolean = false;
  loginError: string = '';
  isShaking: boolean = false;

  // Inject AuthService and Router here
  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef  

  ) {}

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

  onForgot() {
    // navigate to your reset flow
    console.log('Forgot password clicked');
  }
}