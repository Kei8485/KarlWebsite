import { environment } from '../../../environments/environment';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, ModalController } from '@ionic/angular';
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
  imports: [IonContent, IonIcon, CommonModule, FormsModule, AppHeaderComponent, AppButtonComponent]
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
    this.http.get<any[]>(`${this.apiSystemUrl}/subjects/`).subscribe({
      next: (subjects) => {
        const subject = subjects.find(s => s.id.toString() === this.subjectId);
        if (subject) {
          const t = subject.topics.find((t: any) => t.id.toString() === this.topicId);
          if (t) {
            this.topic = JSON.parse(JSON.stringify(t));
            if (!this.topic.questions) {
              this.topic.questions = [];
            }
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  deletedQuestions: number[] = [];
  isSaving = false;

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
            void this.showNotification('Save Failed', 'Could not save the topic. Please try again.', true);
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
            void this.showNotification('Save Failed', 'Could not create the topic. Please try again.', true);
          }
        });
      }
    }
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
        'Your topic was saved, but one or more quiz changes could not be saved. Please try Save All Changes again.',
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
