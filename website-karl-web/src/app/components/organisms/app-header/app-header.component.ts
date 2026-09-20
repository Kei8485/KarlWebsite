import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/angular';
import { AppButtonComponent } from '../../atoms/app-button/app-button.component'; 

// 1. ADDED THIS: Import the icon tools
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

  constructor(public router: Router) {
    // 2. ADDED THIS: Register the specific icons we want to use!
    addIcons({ constructOutline, personCircleOutline });
  }

  ngOnInit() {
    // It grabs the username itself so your pages don't have to!
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      this.currentUserName = savedName;
    }
  }
}