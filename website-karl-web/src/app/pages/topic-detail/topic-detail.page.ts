import { environment } from '../../../environments/environment';
import { Component, OnInit, inject, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
// import { AppHeaderComponent } from '../../components/organisms/app-header/app-header.component';
import { addIcons } from 'ionicons';
import { playCircleOutline, documentTextOutline, bookmarkOutline, helpCircleOutline, checkmarkCircleOutline, closeCircleOutline, refreshOutline } from 'ionicons/icons';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-topic-detail',
  templateUrl: './topic-detail.page.html',
  styleUrls: ['./topic-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule]
})
export class TopicDetailPage implements OnInit {
  
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  topicId: string | null = null;
  topic: any = {}; // Starts empty so the HTML doesn't crash while loading!
  linkifiedNotes = '';
  safeVideoUrl: SafeResourceUrl | null = null;
  selectedVideoIndex = 0;
  isLoading = true;

  // Quiz State
  selectedAnswers: { [questionId: number]: string } = {};
  submittedAnswers: { [questionId: number]: boolean } = {};

  constructor() {
    addIcons({ playCircleOutline, documentTextOutline, bookmarkOutline, helpCircleOutline, checkmarkCircleOutline, closeCircleOutline, refreshOutline });
  }

  ngOnInit() {
    this.topicId = this.route.snapshot.paramMap.get('id');
    this.fetchTopicDetail(); // Call the database!
  }

  selectOption(questionId: number, option: string) {
    if (this.submittedAnswers[questionId]) return; // Prevent changing after submit
    this.selectedAnswers[questionId] = option;
  }

  restartQuiz(questionId: number) {
    this.submittedAnswers[questionId] = false;
    delete this.selectedAnswers[questionId];
  }

  submitAnswer(questionId: number) {
    if (this.selectedAnswers[questionId]) {
      this.submittedAnswers[questionId] = true;
    }
  }

  isAnswerCorrect(question: any): boolean {
    return this.selectedAnswers[question.id] === question.correct_option;
  }

  fetchTopicDetail() {
    this.http.get(`${environment.apiUrl}/topics/${this.topicId}/`).subscribe({
      next: (data: any) => {
        this.topic = data;
        this.linkifiedNotes = this.linkifyNoteUrls(this.topic.notes || '');
        if (!Array.isArray(this.topic.videos)) {
          this.topic.videos = this.topic.youtube_url
            ? [{ url: this.topic.youtube_url, order: 1 }]
            : [];
        }
        this.selectVideo(0);
        
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

  selectVideo(index: number) {
    this.selectedVideoIndex = index;
    const videoUrl = this.topic.videos?.[index]?.url;
    if (!videoUrl) {
      this.safeVideoUrl = null;
      return;
    }

    let finalUrl = videoUrl;
    try {
      const parsedUrl = new URL(videoUrl);
      const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
      if (host === 'youtu.be') {
        finalUrl = `https://www.youtube.com/embed/${parsedUrl.pathname.slice(1)}`;
      } else if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
        const videoId = parsedUrl.searchParams.get('v');
        if (videoId) {
          finalUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (/^\/(shorts|live)\//.test(parsedUrl.pathname)) {
          finalUrl = `https://www.youtube.com/embed/${parsedUrl.pathname.split('/')[2]}`;
        }
      }
    } catch {
      this.safeVideoUrl = null;
      return;
    }

    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  }

  private linkifyNoteUrls(notes: string): string {
    const container = document.createElement('div');
    container.innerHTML = notes;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (!node.parentElement?.closest('a, script, style')) {
        textNodes.push(node as Text);
      }
    }

    const urlPattern = /https?:\/\/[^\s<>"']+/gi;
    for (const textNode of textNodes) {
      const content = textNode.textContent || '';
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      let match: RegExpExecArray | null;

      urlPattern.lastIndex = 0;
      while ((match = urlPattern.exec(content))) {
        let urlText = match[0];
        const trailingPunctuation = urlText.match(/[.,!?;:]+$/)?.[0] || '';
        urlText = urlText.slice(0, urlText.length - trailingPunctuation.length);

        if (!urlText) continue;
        let url: URL;
        try {
          url = new URL(urlText);
        } catch {
          continue;
        }
        if (url.protocol !== 'http:' && url.protocol !== 'https:') continue;

        fragment.append(document.createTextNode(content.slice(cursor, match.index)));
        const link = document.createElement('a');
        link.href = url.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = urlText;
        fragment.append(link, document.createTextNode(trailingPunctuation));
        cursor = match.index + match[0].length;
      }

      if (cursor > 0) {
        fragment.append(document.createTextNode(content.slice(cursor)));
        textNode.parentNode?.replaceChild(fragment, textNode);
      }
    }

    return container.innerHTML;
  }
}
