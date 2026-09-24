import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router'; 
// 🚨 Added ModalController here
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, ModalController } from '@ionic/angular';
import { AppButtonComponent } from '../../atoms/app-button/app-button.component'; 

// 🚨 Imported our gorgeous custom modal!
import { ConfirmModalComponent } from '../../molecules/confirm-modal/confirm-modal.component';

import { addIcons } from 'ionicons';
import { constructOutline, personCircleOutline, menuOutline, closeOutline, logOutOutline } from 'ionicons/icons'; 

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    IonHeader, IonToolbar, IonIcon, 
    AppButtonComponent,
  ]
})
export class AppHeaderComponent implements OnInit {
  currentUserName: string = 'Username';
  currentUrl: string = '';  
  currentUserRole: string = '';
  
  isMobileMenuOpen = false; 

  constructor(
    public router: Router, 
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController // 🚨 Injected the ModalController here
  ) {
    addIcons({ constructOutline, personCircleOutline, menuOutline, closeOutline, logOutOutline });
    this.currentUrl = window.location.pathname;

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        this.currentUserName = localStorage.getItem('userName') || 'Username';
        this.currentUserRole = localStorage.getItem('userRole') || '';
        
        this.isMobileMenuOpen = false; 
        this.cdr.detectChanges();
      }
    });
  }

  ngOnInit() {
    const savedName = localStorage.getItem('userName');
    const savedRole = localStorage.getItem('userRole');
    if (savedName) this.currentUserName = savedName;
    if (savedRole) this.currentUserRole = savedRole; 
  }

  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // 🚨 Updated Logout Function with Confirmation Popup!
  async logout() {
    // 1. Create the confirmation popup
    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal', // Keeps our cool glass effect background
      componentProps: {
        title: 'Log Out?',
        message: 'Are you sure you want to log out of ApexEng?',
        confirmText: 'Log Out',
        isDanger: true // Turns the confirm button Red!
      }
    });
    
    // 2. Show the popup on screen
    await modal.present();

    // 3. Wait for them to click a button
    const { data } = await modal.onWillDismiss();
    
    // 4. If they clicked "Log Out" (which returns true), wipe the data!
    if (data === true) {
      localStorage.clear(); 
      this.isMobileMenuOpen = false;
      this.router.navigate(['/']); 
    }
  }
}