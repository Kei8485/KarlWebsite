import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Consolidate all Ionic imports into one line from '@ionic/angular'
import { IonContent, IonGrid, IonRow, IonCol } from '@ionic/angular';
import { AppButtonComponent } from '../../components/atoms/app-button/app-button.component';
import { AppInputComponent } from '../../components/atoms/app-input/app-input.component';

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

  onLogin() {
    console.log('Logging in with:', this.email, this.accessCode);
    // Next step: We'll wire this to your Django backend!
  }

  onForgot() {
  // navigate to your reset flow
}
}