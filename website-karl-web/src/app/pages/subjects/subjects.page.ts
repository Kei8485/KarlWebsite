import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// 1. ADD THIS IMPORT FOR THE ROUTER
import { Router } from '@angular/router'; 

import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon } from '@ionic/angular';
import { AppButtonComponent } from '../../components/atoms/app-button/app-button.component';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.page.html',
  styleUrls: ['./subjects.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    AppButtonComponent
  ] 
})
export class SubjectsPage {
  
  // 2. ADD THE CONSTRUCTOR HERE INSIDE THE CLASS
  constructor(public router: Router) {}
  
}