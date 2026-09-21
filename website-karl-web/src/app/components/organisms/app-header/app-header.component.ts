import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Added ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router'; // Added NavigationEnd
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/angular';
import { AppButtonComponent } from '../../atoms/app-button/app-button.component'; 

import { addIcons } from 'ionicons';
import { constructOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, 
    AppButtonComponent
  ]
})
export class AppHeaderComponent implements OnInit {
  currentUserName: string = 'Username';
  currentUrl: string = '';  
  currentUserRole: string = '';

    constructor(public router: Router, private cdr: ChangeDetectorRef) {
    addIcons({ constructOutline, personCircleOutline });
    this.currentUrl = window.location.pathname;

    // Listen for page changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        
        this.currentUserName = localStorage.getItem('userName') || 'Username';
        this.currentUserRole = localStorage.getItem('userRole') || '';

        console.log("DEBUG: The Username is ->", this.currentUserName);
        console.log("DEBUG: The Role is ->", this.currentUserRole);
        
        this.cdr.detectChanges();
      }
    });
  }

  ngOnInit() {
    const savedName = localStorage.getItem('userName');
    const savedRole = localStorage.getItem('userRole');
    if (savedName) {
      this.currentUserName = savedName;
    }
    if (savedRole) {
      this.currentUserRole = savedRole; 
    }
  }

  
}