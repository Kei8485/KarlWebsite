import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { HttpClient, HttpClientModule } from '@angular/common/http'; 

import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonGrid, IonRow, IonCol } from '@ionic/angular';
import { AppButtonComponent } from '../../components/atoms/app-button/app-button.component';
import { AppCardComponent } from '../../components/molecules/app-card/app-card.component';
import { AppHeaderComponent } from '../../components/organisms/app-header/app-header.component';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.page.html',
  styleUrls: ['./subjects.page.scss'],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule, 
    HttpClientModule, // The quick hack to allow HTTP requests here
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonRow,
    IonCol,
    IonGrid,
    AppButtonComponent,
    AppCardComponent,
    AppHeaderComponent
  ] 
})
export class SubjectsPage implements OnInit {
  
  currentUserName: string = 'Username';
  databaseSubjects: any[] = []; 

  constructor(
    public router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      this.currentUserName = savedName;
    }
  }

  ngOnInit() {
    this.fetchSubjects();
  }

  fetchSubjects() {
    // If your backend uses /api/, make sure to add it here!
    const url = 'http://127.0.0.1:8000/api/subjects/';
    
    this.http.get(url).subscribe({
      next: (response: any) => {
        this.databaseSubjects = response;
        this.cdr.detectChanges(); // Force the screen to update
        console.log('Database loaded!', this.databaseSubjects);
      },
      error: (err) => {
        console.error('Error fetching subjects', err);
      }
    });
  }
  
    goToTopicTree(id: number) {
    this.router.navigate(['/topic-tree', id]);
  }
}