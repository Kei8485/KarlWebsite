import { Component, ChangeDetectorRef, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { personOutline, keyOutline, mailOutline, lockClosedOutline, logInOutline, constructOutline, locateOutline, bookOutline, shieldCheckmarkOutline, peopleOutline } from 'ionicons/icons';
import { IonContent, IonGrid, IonRow, IonCol, IonIcon, IonModal, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
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
    IonIcon,
    IonModal,
    AppButtonComponent, 
    AppInputComponent,
  ]
})
export class LoginPage implements OnInit {
  @ViewChild('featureTrack') featureTrack?: ElementRef<HTMLElement>;

  readonly featureIndices = [0, 1, 2, 3];
  email: string = '';
  accessCode: string = '';
  
  isLoading: boolean = false;
  loginError: string = '';
  isShaking: boolean = false;
  isLoginModalOpen: boolean = false;
  sessionExpired = false;
  activeFeatureIndex = 0;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController
  ) {
     addIcons({
       personOutline,
       keyOutline,
       mailOutline,
       lockClosedOutline,
       logInOutline,
       constructOutline,
       locateOutline,
       bookOutline,
       shieldCheckmarkOutline,
       peopleOutline,
     });
  }

  ngOnInit() {
    this.sessionExpired = this.route.snapshot.queryParamMap.get('sessionExpired') === 'true';
    if (this.sessionExpired) {
      this.isLoginModalOpen = true;
    }
  }

  openLoginModal() {
    this.loginError = '';
    this.isLoginModalOpen = true;
  }

  onFeatureScroll(event: Event) {
    const track = event.currentTarget as HTMLElement;
    if (track.clientWidth === 0) return;

    this.activeFeatureIndex = Math.round(track.scrollLeft / track.clientWidth);
  }

  scrollToFeature(index: number) {
    const track = this.featureTrack?.nativeElement;
    if (!track) return;

    track.scrollTo({
      left: index * track.clientWidth,
      behavior: 'smooth',
    });
  }

  onLogin() {
    if (this.isLoading) return;

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
        localStorage.setItem('authToken', response.token);
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