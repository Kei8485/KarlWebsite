import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, IonIcon } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { mailOutline, paperPlaneOutline, closeOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-forgot-code-modal',
  templateUrl: './forgot-code-modal.component.html',
  styleUrls: ['./forgot-code-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon]
})
export class ForgotCodeModalComponent {
  email: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  private modalCtrl = inject(ModalController);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor() {
    addIcons({ mailOutline, paperPlaneOutline, closeOutline, checkmarkCircleOutline });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  sendCode() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email address.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.http.post(`${this.apiUrl}/forgot-code/`, { email: this.email }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'A new access code has been sent to your email!';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Email not found. Please check and try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
