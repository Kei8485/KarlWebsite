import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Added ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IonContent, IonSpinner } from '@ionic/angular';
import { TopicCardComponent } from '../../components/molecules/topic-card/topic-card.component';

@Component({
  selector: 'app-topic-tree',
  templateUrl: './topic-tree.page.html',
  styleUrls: ['./topic-tree.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonSpinner, TopicCardComponent] 
})
export class TopicTreePage implements OnInit {
  subjectId: string | null = null;
  subjectData: any = null; 
  topics: any[] = [];
  isLoading = true;

  // 2. Injected it into the constructor
  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.subjectId = this.route.snapshot.paramMap.get('id');
    if (this.subjectId) {
      this.fetchTopics();
    }
  }

    fetchTopics() {
    console.log('1. Starting fetch for subject ID:', this.subjectId);
    
    this.http.get(`http://127.0.0.1:8000/api/subjects/${this.subjectId}/topics/`)
      .subscribe({
                next: (data: any) => {
          this.subjectData = data;
          this.topics = data.topics || []; 
          this.isLoading = false;
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error('2. ERROR from Django:', err);
          this.isLoading = false;
          this.cdr.detectChanges(); 
        }
      });
  }
}