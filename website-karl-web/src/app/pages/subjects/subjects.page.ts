import { environment } from '../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs';
import { addIcons } from 'ionicons';
import { arrowForwardOutline } from 'ionicons/icons';
import { IonContent, IonGrid, IonRow, IonCol, IonRefresher, IonRefresherContent, IonSpinner } from '@ionic/angular';
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
    IonContent,
    IonRow,
    IonCol,
    IonGrid,
    IonSpinner,
    AppButtonComponent,
    AppCardComponent,
    IonRefresher,
    IonRefresherContent,
  ] 
})
export class SubjectsPage implements OnInit {
  
  currentUserName: string = 'Username';
  databaseSubjects: any[] = []; 
  isLoading = false;
  loadError = '';
  private requestInProgress = false;

  constructor(
    public router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ arrowForwardOutline });
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      this.currentUserName = savedName;
    }
  }

  ngOnInit() {
    this.fetchSubjects();
  }

  ionViewWillEnter() {
    this.fetchSubjects();
  }

  fetchSubjects(event?: any) {
    if (this.requestInProgress) {
      event?.target.complete();
      return;
    }

    this.requestInProgress = true;
    this.loadError = '';
    if (!event) {
      this.isLoading = true;
    }
    const url = `${environment.apiUrl}/subjects/`;
    
    this.http.get<any[]>(url).pipe(
      finalize(() => {
        this.requestInProgress = false;
        this.isLoading = false;
        event?.target.complete();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        this.databaseSubjects = response;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching subjects', err);
        this.loadError = 'Could not load subjects. Please check your connection and try again.';
        this.cdr.detectChanges();
      }
    });
  }
  
  handleRefresh(event: any) {
    this.fetchSubjects(event);
  }

  goToTopicTree(id: number) {
    this.router.navigate(['/topic-tree', id]);
  }
}
