import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router'; // Grabs URL data
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButtons, IonBackButton } from '@ionic/angular';
import { AppCardComponent } from '../../components/molecules/app-card/app-card.component';
import { AppButtonComponent } from '../../components/atoms/app-button/app-button.component';
import { AppHeaderComponent } from '../../components/organisms/app-header/app-header.component';


@Component({
  selector: 'app-topic-tree',
  templateUrl: './topic-tree.page.html',
  styleUrls: ['./topic-tree.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonButtons, IonBackButton,
    AppCardComponent,AppHeaderComponent,
    AppButtonComponent
  ]
})
export class TopicTreePage implements OnInit {
  subjectId: string | null = null;
  topics: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // 1. Grab the ID from the URL (e.g. /topic-tree/3 grabs the '3')
    this.subjectId = this.route.snapshot.paramMap.get('id');

    if (this.subjectId) {
      this.fetchTopics();
    }
  }

  fetchTopics() {
    // 2. Call your Django URL!
    const url = `http://127.0.0.1:8000/api/subjects/${this.subjectId}/topics/`;
    
    this.http.get(url).subscribe({
      next: (response: any) => {
        this.topics = response;
        this.cdr.detectChanges(); // Force UI update
        console.log('Topics loaded!', this.topics);
      },
      error: (err) => {
        console.error('Error fetching topics', err);
      }
    });
  }
}