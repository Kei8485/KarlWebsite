import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonDatetime, IonModal, IonButton, IonButtons, ModalController } from '@ionic/angular';
import { finalize, forkJoin } from 'rxjs';
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
  selectedArchivedIds = new Set<number>();
  isDeletingArchived = false;
  editingStudyId: number | null = null; // Track if we're editing an existing study

  get allArchivedSelected() {
    return this.archivedStudies.length > 0 &&
      this.archivedStudies.every(study => this.selectedArchivedIds.has(study.id));
  }

  getLocalISOString(dateString?: string) {
    const now = dateString ? new Date(dateString) : new Date();
    // Offset minutes adjusted to milliseconds
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, -1); // Remove the 'Z' so Ionic treats it as local time
  }

  prepareSchedulePicker() {
    const now = new Date();
    this.todayDate = this.getLocalISOString();
    if (new Date(this.scheduleDate).getTime() < now.getTime()) {
      this.scheduleDate = this.todayDate;
    }
  }

  constructor(
    private plannerService: PlannerService,
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef
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
      const archivedIds = new Set(this.archivedStudies.map((study: any) => study.id));
      this.selectedArchivedIds = new Set(
        [...this.selectedArchivedIds].filter(id => archivedIds.has(id))
      );
      this.cdr.detectChanges();
    });
  }

  toggleArchivedSelection(studyId: number, selected: boolean) {
    if (this.isDeletingArchived) return;
    if (selected) {
      this.selectedArchivedIds.add(studyId);
    } else {
      this.selectedArchivedIds.delete(studyId);
    }
  }

  toggleSelectAllArchived(selected: boolean) {
    if (this.isDeletingArchived) return;
    this.selectedArchivedIds = selected
      ? new Set(this.archivedStudies.map(study => study.id))
      : new Set<number>();
  }

  onArchivedSelectionChange(event: Event, studyId?: number) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    if (studyId === undefined) {
      this.toggleSelectAllArchived(target.checked);
    } else {
      this.toggleArchivedSelection(studyId, target.checked);
    }
  }

  async deleteArchivedStudies(deleteAll: boolean) {
    if (this.isDeletingArchived) return;

    const studiesToDelete = deleteAll
      ? [...this.archivedStudies]
      : this.archivedStudies.filter(study => this.selectedArchivedIds.has(study.id));
    if (studiesToDelete.length === 0) return;

    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: deleteAll ? 'Delete All Archived Sessions' : 'Delete Selected Sessions',
        message: deleteAll
          ? `Permanently delete all <strong>${studiesToDelete.length}</strong> archived study sessions? This cannot be undone.`
          : `Permanently delete <strong>${studiesToDelete.length}</strong> selected archived study sessions? This cannot be undone.`,
        confirmText: deleteAll ? 'Delete All' : 'Delete Selected',
        isDanger: true
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== true) return;

    this.isDeletingArchived = true;
    forkJoin(studiesToDelete.map(study => this.plannerService.deleteScheduledStudy(study.id)))
      .pipe(finalize(() => {
        this.isDeletingArchived = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          const deletedIds = new Set(studiesToDelete.map(study => study.id));
          this.archivedStudies = this.archivedStudies.filter(study => !deletedIds.has(study.id));
          this.selectedArchivedIds = new Set(
            [...this.selectedArchivedIds].filter(id => !deletedIds.has(id))
          );
          this.cdr.detectChanges();
        },
        error: async (err) => {
          console.error('Error deleting archived study sessions:', err);
          this.loadStudies();
          await this.showNotification(
            'Delete Failed',
            'Some archived sessions could not be deleted. The archive has been refreshed.',
            true
          );
        }
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
        cancelText: 'Back',
        isDanger: true
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data === true) {
      this.plannerService.deleteScheduledStudy(studyId).subscribe({
        next: () => {
          this.upcomingStudies = this.upcomingStudies.filter(study => study.id !== studyId);
          this.archivedStudies = this.archivedStudies.filter(study => study.id !== studyId);
          this.cdr.detectChanges();
        },
        error: async () => {
          this.cdr.detectChanges();
          await this.showNotification('Error', 'Failed to cancel study session. Please try again.', true);
        }
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

    if (new Date(this.scheduleDate).getTime() <= Date.now()) {
      await this.showNotification('Invalid Time', 'Please choose a future date and time.', true);
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
        this.plannerService.updateScheduledStudy(this.editingStudyId, payload).subscribe({
          next: async (res: any) => {
            this.upcomingStudies = this.upcomingStudies
              .map(study => study.id === res.id ? res : study)
              .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());
            this.cancelEdit();
            this.cdr.detectChanges();
            await this.showNotification('Schedule Updated', 'Your study session has been updated successfully! ✅', false);
          },
          error: async () => {
            this.cdr.detectChanges();
            await this.showNotification('Error', 'Failed to update study session. Please try again.', true);
          }
        });
      }
    } else {
      // Create new schedule
      this.plannerService.scheduleStudy(this.currentUserId, payload).subscribe({
        next: async (res: any) => {
          this.upcomingStudies = [...this.upcomingStudies, res]
            .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());
          this.scheduleTitle = '';
          this.scheduleSubject = '';
          this.scheduleDate = this.getLocalISOString();
          this.activeTab = 'upcoming';
          this.cdr.detectChanges();
          await this.showNotification('Schedule Set', 'Your study session has been scheduled successfully! ✅', false);
        },
        error: async () => {
          this.cdr.detectChanges();
          await this.showNotification('Error', 'Failed to schedule study session. Please try again.', true);
        }
      });
    }
  }
}
