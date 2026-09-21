import { Component, OnInit, inject, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { AppHeaderComponent } from '../../components/organisms/app-header/app-header.component';
import { addIcons } from 'ionicons';
import { playCircleOutline, documentTextOutline, bookmarkOutline } from 'ionicons/icons';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-topic-detail',
  templateUrl: './topic-detail.page.html',
  styleUrls: ['./topic-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, AppHeaderComponent]
})
export class TopicDetailPage implements OnInit {
  
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  topicId: string | null = null;
  topic: any = {}; // Starts empty so the HTML doesn't crash while loading!
  safeVideoUrl!: SafeResourceUrl;
  isLoading = true;

  constructor() {
    addIcons({ playCircleOutline, documentTextOutline, bookmarkOutline });
  }

  ngOnInit() {
    this.topicId = this.route.snapshot.paramMap.get('id');
    this.fetchTopicDetail(); // Call the database!
  }

    fetchTopicDetail() {
    this.http.get(`http://127.0.0.1:8000/api/topics/${this.topicId}/`).subscribe({
      next: (data: any) => {
        this.topic = data;
        
        if (this.topic.youtube_url) {
          
          // 🚨 THE MAGIC CONVERTER 🚨
          let finalUrl = this.topic.youtube_url;
          
          // 1. If it's a standard desktop link (youtube.com/watch?v=12345)
          if (finalUrl.includes('watch?v=')) {
            const videoId = finalUrl.split('watch?v=')[1].split('&')[0];
            finalUrl = `https://www.youtube.com/embed/${videoId}`;
          } 
          // 2. If it's a mobile share link (youtu.be/12345)
          else if (finalUrl.includes('youtu.be/')) {
            const videoId = finalUrl.split('youtu.be/')[1].split('?')[0];
            finalUrl = `https://www.youtube.com/embed/${videoId}`;
          }

          // Now we trust the perfectly formatted URL!
          this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
        }
        
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Failed to load topic:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}