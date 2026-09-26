import { environment } from '../../../environments/environment';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonSpinner, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline, saveOutline, addOutline, bookOutline, arrowBackOutline } from 'ionicons/icons';
import { AppHeaderComponent } from '../../components/organisms/app-header/app-header.component';
import { AppButtonComponent } from '../../components/atoms/app-button/app-button.component';
import { ConfirmModalComponent } from '../../components/molecules/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-manage-topic',
  templateUrl: './manage-topic.page.html',
  styleUrls: ['./manage-topic.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonSpinner, CommonModule, FormsModule, AppHeaderComponent, AppButtonComponent]
})
export class ManageTopicPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private modalCtrl = inject(ModalController);

  apiSystemUrl = environment.apiUrl;
  
  subjectId: string | null = null;
  topicId: string | null = null;
  
  topic: any = {
    title: '',
    description: '',
    youtube_url: '',
    notes: '',
    order: 1,
    questions: []
  };

  constructor() {
    addIcons({ trashOutline, saveOutline, addOutline, bookOutline, arrowBackOutline });
  }

  ngOnInit() {
    this.subjectId = this.route.snapshot.paramMap.get('subjectId');
    this.topicId = this.route.snapshot.paramMap.get('topicId');

    if (this.topicId && this.topicId !== 'new') {
      this.loadTopic();
    }
  }

  goBack() {
    this.router.navigate(['/manage-users']);
  }

  loadTopic() {
    this.isLoadingTopic = true;
    this.topicLoadError = '';
    this.http.get<any[]>(`${this.apiSystemUrl}/subjects/`).subscribe({
      next: (subjects) => {
        const subject = subjects.find(s => s.id.toString() === this.subjectId);
        const topic = subject?.topics.find((item: any) => item.id.toString() === this.topicId);

        if (!topic) {
          this.topicLoadError = 'This topic could not be found. It may have been deleted.';
          this.isLoadingTopic = false;
          this.cdr.detectChanges();
          return;
        }

        this.topic = JSON.parse(JSON.stringify(topic));
        if (!this.topic.questions) this.topic.questions = [];
        this.isLoadingTopic = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading topic:', err);
        this.topicLoadError = 'Could not load this topic. Check your connection and try again.';
        this.isLoadingTopic = false;
        this.cdr.detectChanges();
      }
    });
  }

  deletedQuestions: number[] = [];
  isSaving = false;
  isLoadingTopic = false;
  topicLoadError = '';
  topicSaveError = '';
  videoUrlError = '';

  addQuestion() {
    if (!this.topic.questions) {
      this.topic.questions = [];
    }
    this.topic.questions.push({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A'
    });
  }

  async removeQuestion(index: number) {
    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: 'Remove Question?',
        message: 'Are you sure you want to remove this question? Click Save All Changes above to apply this removal.',
        confirmText: 'Remove Question',
        cancelText: 'Back',
        isDanger: true
      }
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== true) return;

    const q = this.topic.questions[index];
    if (q.id) {
      this.deletedQuestions.push(q.id);
    }
    this.topic.questions.splice(index, 1);
    this.cdr.detectChanges();
  }

  setCorrectOption(qIndex: number, option: string) {
    this.topic.questions[qIndex].correct_option = option;
  }

  async saveTopic() {
    if (this.isSaving) return;
    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: 'Save Topic',
        message: `Are you sure you want to save changes to <strong>${this.topic.title || 'this topic'}</strong>?`,
        confirmText: 'Save',
        isDanger: false
      }
    });
    
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data === true) {
      this.isSaving = true;
      this.topicSaveError = '';
      this.videoUrlError = '';
      const payload = {
        ...this.topic,
        subject: this.subjectId
      };

      if (this.topicId !== 'new') {
        this.http.put(`${this.apiSystemUrl}/topics/manage/${this.topicId}/`, payload).subscribe({
          next: () => {
            void this.saveQuizzes();
          },
          error: (err) => {
            this.isSaving = false;
            console.error('Error saving topic:', err);
            this.handleTopicSaveError(err, 'Could not save the topic. Please try again.');
          }
        });
      } else {
        this.http.post(`${this.apiSystemUrl}/topics/create/`, payload).subscribe({
          next: (res: any) => {
            this.topicId = res.id;
            void this.saveQuizzes();
          },
          error: (err) => {
            this.isSaving = false;
            console.error('Error creating topic:', err);
            this.handleTopicSaveError(err, 'Could not create the topic. Please try again.');
          }
        });
      }
    }
  }

  clearTopicErrors() {
    this.topicSaveError = '';
    this.videoUrlError = '';
  }

  private handleTopicSaveError(error: unknown, fallback: string) {
    const response = (error as { error?: unknown } | null)?.error;
    const fieldErrors = response && typeof response === 'object'
      ? response as Record<string, unknown>
      : {};
    const videoUrlErrors = fieldErrors['youtube_url'];

    this.videoUrlError = Array.isArray(videoUrlErrors)
      ? videoUrlErrors.join(' ')
      : typeof videoUrlErrors === 'string'
        ? videoUrlErrors
        : '';

    this.topicSaveError = this.getErrorMessage(error, fallback);
    void this.showNotification('Save Failed', this.topicSaveError, true);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    const response = (error as { error?: unknown } | null)?.error;
    if (typeof response === 'string' && response.trim()) return response;
    if (!response || typeof response !== 'object') return fallback;

    const details = response as Record<string, unknown>;
    for (const key of ['detail', 'error', 'message', 'youtube_url', 'title', 'notes']) {
      const value = details[key];
      if (typeof value === 'string' && value.trim()) return value;
      if (Array.isArray(value) && value.length) return value.join(' ');
    }

    const validationMessages = Object.entries(details)
      .flatMap(([field, value]) => {
        const messages = Array.isArray(value) ? value : [value];
        return messages
          .filter((message): message is string => typeof message === 'string')
          .map(message => `${this.getFieldLabel(field)}: ${message}`);
      });
    return validationMessages.length ? validationMessages.join(' ') : fallback;
  }

  private getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      youtube_url: 'Video URL',
      title: 'Topic title',
      notes: 'Notes',
      subject: 'Subject',
      order: 'Order'
    };
    return labels[field] || field;
  }

  async saveQuizzes() {
    const requests: any[] = [];
    
    for (const id of this.deletedQuestions) {
      requests.push(this.http.delete(`${this.apiSystemUrl}/quizzes/manage/${id}/`).toPromise());
    }

    for (const q of this.topic.questions) {
      const payload = { ...q, topic: this.topicId };
      if (q.id) {
        requests.push(this.http.put(`${this.apiSystemUrl}/quizzes/manage/${q.id}/`, payload).toPromise());
      } else {
        requests.push(this.http.post(`${this.apiSystemUrl}/quizzes/create/`, payload).toPromise());
      }
    }

    try {
      if (requests.length > 0) {
        await Promise.all(requests);
      }
    } catch (err) {
      console.error('Error saving quizzes:', err);
      this.isSaving = false;
      this.cdr.detectChanges();
      await this.showNotification(
        'Save Failed',
        `Your topic was saved, but one or more quiz changes could not be saved. ${this.getErrorMessage(err, 'Please check the quiz details and try again.')}`,
        true
      );
      return;
    }

    this.deletedQuestions = [];
    this.isSaving = false;
    this.goBack();
  }

  async showNotification(title: string, message: string, isDanger = false) {
    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title,
        message,
        confirmText: 'OK',
        cancelText: '',
        isDanger
      }
    });

    await modal.present();
    await modal.onWillDismiss();
  }
}
