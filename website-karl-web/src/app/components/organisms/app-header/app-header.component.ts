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
  currentUrl: string = ''; // 1. We will track the URL here

  constructor(public router: Router, private cdr: ChangeDetectorRef) {
    addIcons({ constructOutline, personCircleOutline });
    
    // Grab the URL immediately on load
    this.currentUrl = window.location.pathname;

    // 2. Listen for page changes and FORCE the buttons to redraw!
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        this.cdr.detectChanges(); 
      }
    });
  }

  ngOnInit() {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      this.currentUserName = savedName;
    }
  }
}