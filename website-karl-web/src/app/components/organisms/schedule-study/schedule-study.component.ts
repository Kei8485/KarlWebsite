import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonDatetime, IonModal, IonButton, IonButtons, ModalController } from '@ionic/angular';
import { AppButtonComponent } from '../../atoms/app-button/app-button.component';
import { AppInputComponent } from '../../atoms/app-input/app-input.component';
import { ConfirmModalComponent } from '../../molecules/confirm-modal/confirm-modal.component';
import { addIcons } from 'ionicons';
import { mailOutline, timeOutline, calendarOutline, checkmarkCircle, trashOutline, createOutline } from 'ionicons/icons';
import { PlannerService } from '../../../services/planner';

@Component({
  selector: 'app-schedule-study',
  templateUrl: './schedule-study.component.html',
  styleUrls: ['./schedule-study.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonDatetime, IonModal, IonButton, AppButtonComponent, AppInputComponent]
})
export class ScheduleStudyComponent implements OnInit {
  scheduleTitle: string = '';
  scheduleSubject: string = '';
  
  // We need to calculate the local time ISO string because regular toISOString() 
  // uses UTC time, which puts you exactly 8 hours behind in the Philippines!
  scheduleDate: string = this.getLocalISOString();
  todayDate: string = this.getLocalISOString();
  @Input() currentUserId: number | null = null;

  activeTab: 'new' | 'upcoming' | 'archived' = 'new';
  upcomingStudies: any[] = [];
  archivedStudies: any[] = [];
  editingStudyId: number | null = null; // Track if we're editing an existing study

  getLocalISOString(dateString?: string) {
    const now = dateString ? new Date(dateString) : new Date();
    // Offset minutes adjusted to milliseconds
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, -1); // Remove the 'Z' so Ionic treats it as local time
  }

  constructor(
    private plannerService: PlannerService,
    private modalCtrl: ModalController
  ) {
    addIcons({ mailOutline, timeOutline, calendarOutline, checkmarkCircle, trashOutline, createOutline });
  }

  ngOnInit() {
    this.loadStudies();
  }

  loadStudies() {
    if (!this.currentUserId) return;
    this.plannerService.getScheduledStudies(this.currentUserId).subscribe(res => {
      this.upcomingStudies = res.filter((study: any) => !study.is_sent);
      this.archivedStudies = res.filter((study: any) => study.is_sent);
    });
  }

  editStudy(study: any) {
    this.editingStudyId = study.id;
    this.scheduleTitle = study.title;
    this.scheduleSubject = study.subject || '';
    this.scheduleDate = this.getLocalISOString(study.scheduled_time);
    this.activeTab = 'new';
  }

  cancelEdit() {
    this.editingStudyId = null;
    this.scheduleTitle = '';
    this.scheduleSubject = '';
    this.scheduleDate = this.getLocalISOString();
    this.activeTab = 'upcoming';
  }

  async confirmCancelStudy(studyId: number) {
    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: 'Cancel Session',
        message: 'Are you sure you want to cancel this scheduled study session?',
        confirmText: 'Cancel Session',
        isDanger: true
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data === true) {
      this.plannerService.deleteScheduledStudy(studyId).subscribe(() => {
        this.loadStudies();
      });
    }
  }

  async showNotification(title: string, message: string, isDanger: boolean = false) {
    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: title,
        message: message,
        confirmText: 'OK',
        cancelText: '',
        isDanger: isDanger
      }
    });
    await modal.present();
    await modal.onWillDismiss();
  }

  async saveSchedule() {
    if (!this.currentUserId) {
      await this.showNotification('Missing ID', 'Error: No User ID found. Try logging out and logging back in.', true);
      return;
    }
    
    if (!this.scheduleTitle || !this.scheduleTitle.trim()) {
      await this.showNotification('Missing Field', 'Please enter a topic to review!', true);
      return;
    }

    const payload = {
      title: this.scheduleTitle,
      subject: this.scheduleSubject,
      scheduled_time: new Date(this.scheduleDate).toISOString()
    };

    if (this.editingStudyId) {
      // 1. Confirm before update
      const modal = await this.modalCtrl.create({
        component: ConfirmModalComponent,
        cssClass: 'transparent-modal',
        componentProps: {
          title: 'Update Session',
          message: 'Are you sure you want to save these changes to your schedule?',
          confirmText: 'Save Changes',
          isDanger: false
        }
      });
      await modal.present();
      const { data } = await modal.onWillDismiss();
      
      if (data === true) {
        this.plannerService.updateScheduledStudy(this.editingStudyId, payload).subscribe(async res => {
          await this.showNotification('Schedule Updated', 'Your study session has been updated successfully! ✅', false);
          this.cancelEdit(); // Reset form and switch back to list
          this.loadStudies();
        }, async err => {
          await this.showNotification('Error', 'Failed to update study session. Please try again.', true);
        });
      }
    } else {
      // Create new schedule
      this.plannerService.scheduleStudy(this.currentUserId, payload).subscribe(async res => {
        await this.showNotification('Schedule Set', 'Your study session has been scheduled successfully! ✅', false);
        this.scheduleTitle = '';
        this.scheduleSubject = '';
        this.scheduleDate = this.getLocalISOString();
        this.loadStudies();
        this.activeTab = 'upcoming';
      }, async err => {
        await this.showNotification('Error', 'Failed to schedule study session. Please try again.', true);
      });
    }
  }
}
