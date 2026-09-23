import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon, IonDatetime, IonDatetimeButton, IonModal, ModalController, IonPicker, IonPickerColumn, IonPickerColumnOption } from '@ionic/angular';
import { PlannerService } from '../../services/planner'; 
import { AppHeaderComponent } from '../../components/organisms/app-header/app-header.component';
import { ConfirmModalComponent } from '../../components/molecules/confirm-modal/confirm-modal.component';
import { AppButtonComponent } from '../../components/atoms/app-button/app-button.component'; 
import { AppInputComponent } from '../../components/atoms/app-input/app-input.component'; 
import { ScheduleStudyComponent } from '../../components/organisms/schedule-study/schedule-study.component';

import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, ellipseOutline, trashOutline, playOutline, squareOutline, refreshOutline, timeOutline, addOutline, calendarOutline, swapVerticalOutline, checkmarkOutline, createOutline, arrowBackOutline } from 'ionicons/icons';
import { IonButtons } from "@ionic/angular";

@Component({
  selector: 'app-planner',
  templateUrl: './planner.page.html',
  styleUrls: ['./planner.page.scss'],
  standalone: true,
  imports: [IonButtons, IonContent, IonButton, IonIcon, IonDatetime, IonDatetimeButton, IonModal, IonPicker, IonPickerColumn, IonPickerColumnOption, CommonModule, FormsModule, AppHeaderComponent, AppButtonComponent, AppInputComponent, ScheduleStudyComponent]
})
export class PlannerPage implements OnInit, OnDestroy {
  
  showSchedule: boolean = false; // Toggle state for flip card
  currentUserId: number = 1; 
  totalStudyTime: string = '0h 0m';
  tasks: any[] = [];
  
  // Task Form & Sorting State
  isAddingTask: boolean = false;
  sortOrder: 'asc' | 'desc' = 'asc';
  newTaskTitle: string = '';
  newTaskSubject: string = '';
  
  // Helper to get local time for Ionic datetime picker
  getLocalISOString() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, -1);
  }

  newTaskDate: string = this.getLocalISOString();
  todayDate: string = this.getLocalISOString();
  editingTaskId: number | null = null; // 🚨 Edit State

  // Timer State
  timerMinutes: number = 0; 
  timeLeft: number = 0;
  originalTimeLeft: number = 0;
  timerInterval: any;
  isTimerRunning: boolean = false;
  displayTime: string = '00:00:00';
  inputHours: number = 0;
  inputMinutes: number = 0;
  inputSeconds: number = 0;
  hoursList = Array.from({ length: 100 }, (_, i) => i);
  minsList = Array.from({ length: 60 }, (_, i) => i);
  secsList = Array.from({ length: 60 }, (_, i) => i);


  constructor(
    private plannerService: PlannerService,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController
  ) {
    addIcons({ 
      checkmarkCircleOutline, ellipseOutline, trashOutline, playOutline, 
      squareOutline, refreshOutline, timeOutline, addOutline, 
      calendarOutline, swapVerticalOutline, checkmarkOutline, createOutline,
      arrowBackOutline
    });
  }

  toggleView() {
    this.showSchedule = !this.showSchedule;
  }

  ngOnInit() {
    const storedId = localStorage.getItem('userId');
    if (storedId) this.currentUserId = parseInt(storedId, 10);
    this.loadTasks();
    this.loadStats();
    this.updateDisplayTime();
  }

  ngOnDestroy() {
    this.stopTimer(); 
  }

  // ==========================================
  // REUSABLE NOTIFICATION
  // ==========================================

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

  // ==========================================
  // 1. TASKS LOGIC
  // ==========================================
  
  get filteredAndSortedTasks() {
    let result = [...this.tasks];
    result.sort((a, b) => {
      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();
      return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return result;
  }

  toggleSort() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  }

  cancelAddTask() {
    this.isAddingTask = false;
    this.newTaskTitle = '';
    this.newTaskSubject = '';
    this.editingTaskId = null;  
  }

  editTask(task: any) {
    this.isAddingTask = true;
    this.editingTaskId = task.id;
    this.newTaskTitle = task.title;
    this.newTaskSubject = task.subject;
    this.newTaskDate = task.due_date;
  }

  loadTasks() {
    this.plannerService.getTasks(this.currentUserId).subscribe(res => {
      this.tasks = res;
      this.cdr.detectChanges(); 
    });
  }

  loadStats() {
    this.plannerService.getWeeklyStats(this.currentUserId).subscribe(res => {
      this.totalStudyTime = res.formatted_time;
      this.cdr.detectChanges(); 
    });
  }

  async addTask() {
    if (!this.newTaskTitle || this.newTaskTitle.trim() === '') {
      await this.showNotification('Missing Field', 'Please enter a task name!', true);
      return;
    }

    const isEditing = this.editingTaskId !== null;

    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: isEditing ? 'Update Task' : 'Add New Task',
        message: isEditing 
          ? `Save changes to "<strong>${this.newTaskTitle}</strong>"?` 
          : `Are you sure you want to add "<strong>${this.newTaskTitle}</strong>" to your upcoming tasks?`,
        confirmText: isEditing ? 'Update Task' : 'Create Task',
        isDanger: false
      }
    });
    
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    // 🚨 FIXED: Now it only saves if they clicked Confirm, and taskData is defined!
    if (data === true) {
      const taskData = { 
        title: this.newTaskTitle, 
        subject: this.newTaskSubject, 
        due_date: new Date(this.newTaskDate).toISOString() 
      };

      if (isEditing) {
        this.plannerService.updateTask(this.editingTaskId!, taskData).subscribe({
          next: () => {
            this.cancelAddTask(); 
            this.loadTasks(); 
            this.showNotification('Task Updated', 'Your task has been successfully updated! ✅');
          },
          error: () => this.showNotification('Error', 'Failed to update the task. Please try again.', true)
        });
      } else {
        this.plannerService.addTask(this.currentUserId, taskData).subscribe({
          next: () => {
            this.cancelAddTask(); 
            this.loadTasks(); 
            this.showNotification('Task Added', 'Your task has been successfully added! ✅');
          },
          error: () => this.showNotification('Error', 'Failed to save the task. Please try again.', true)
        });
      }
    }
  }

  toggleTask(taskId: number) {
    this.plannerService.toggleTaskComplete(taskId).subscribe(() => {
      this.loadTasks();
    });
  }

  async confirmDelete(taskId: number) {
    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: 'Delete Task',
        message: 'Are you sure you want to delete this task?',
        confirmText: 'Delete Task',
        isDanger: true
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data === true) {
      this.plannerService.deleteTask(taskId).subscribe(() => {
        this.loadTasks();
      });
    }
  }

  // ==========================================
  // 2. STUDY TIMER LOGIC
  // ==========================================
  
  onPickerChange(type: string, event: any) {
    const val = event.detail.value;
    if (type === 'hours') this.inputHours = val;
    if (type === 'minutes') this.inputMinutes = val;
    if (type === 'seconds') this.inputSeconds = val;
    this.onCustomTimeChange();
  }

  setCustomTime(mins: number) {
    this.stopTimer();
    this.inputHours = Math.floor(mins / 60);
    this.inputMinutes = mins % 60;
    this.inputSeconds = 0;
    this.timerMinutes = mins;
    this.timeLeft = mins * 60;
    this.updateDisplayTime();
  }

  onCustomTimeChange() {
    this.stopTimer();
    if (this.inputHours == null) this.inputHours = 0;
    if (this.inputMinutes == null) this.inputMinutes = 0;
    if (this.inputSeconds == null) this.inputSeconds = 0;
    if (this.inputHours > 99) this.inputHours = 99;
    if (this.inputMinutes > 59) this.inputMinutes = 59;
    if (this.inputSeconds > 59) this.inputSeconds = 59;
    this.timeLeft = (this.inputHours * 3600) + (this.inputMinutes * 60) + this.inputSeconds;
    this.timerMinutes = Math.round(this.timeLeft / 60);
    this.updateDisplayTime();
  }

  async startTimer() {
    if (this.isTimerRunning) return;
    if (this.timeLeft <= 0) {
      await this.showNotification('No Time Set', 'Please set a time before starting!', true);
      return;
    }
    
    this.originalTimeLeft = this.timeLeft;
    this.isTimerRunning = true;

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateDisplayTime();
      this.cdr.detectChanges(); 
      if (this.timeLeft <= 0) {
        this.timerFinished();
      }
    }, 1000);
  }

  stopTimer() {
    this.isTimerRunning = false;
    clearInterval(this.timerInterval);
  }

  resetTimer() {
    this.stopTimer();
    this.inputHours = 0;
    this.inputMinutes = 0;
    this.inputSeconds = 0;
    this.timerMinutes = 0;
    this.timeLeft = 0;
    this.originalTimeLeft = 0;
    this.updateDisplayTime();
    this.cdr.detectChanges();
  }

  async confirmReset() {
    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: 'Reset Timer',
        message: 'Are you sure? Your current session will <strong>NOT</strong> be saved to Weekly Focus.',
        confirmText: 'Reset',
        isDanger: true
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data === true) {
      this.resetTimer();
    }
  }

  async doneTimer() {
    const elapsedSeconds = this.originalTimeLeft - this.timeLeft;
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    const modal = await this.modalCtrl.create({
      component: ConfirmModalComponent,
      cssClass: 'transparent-modal',
      componentProps: {
        title: 'Finish Session',
        message: `Save <strong>${elapsedMinutes} minute(s)</strong> to your Weekly Focus?`,
        confirmText: 'Save Session',
        isDanger: false
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data === true) {
      this.stopTimer();
      this.plannerService.saveStudySession(this.currentUserId, elapsedMinutes).subscribe({
        next: () => {
          this.loadStats();
          this.showNotification('Session Saved!', `Great work! ${elapsedMinutes} minute(s) saved to your Weekly Focus! 🎉`);
          this.resetTimer();
        },
        error: () => {
          this.showNotification('Error', 'Could not save your session. Please try again.', true);
        }
      });
    }
  }

  updateDisplayTime() {
    const h = Math.floor(this.timeLeft / 3600);
    const m = Math.floor((this.timeLeft % 3600) / 60);
    const s = this.timeLeft % 60;
    this.displayTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  timerFinished() {
    this.stopTimer();
    const audio = new Audio('../../../assets/audio/ssstik.io_1790134444520.mp3');
    audio.loop = true;
    audio.play();
    
    this.plannerService.saveStudySession(this.currentUserId, this.timerMinutes).subscribe({
      next: () => {
        this.loadStats(); 
        // When they click OK, the modal dismisses and THEN we stop the sound
        this.showNotification("Time's Up! 🎉", 'Amazing work! Your full session has been saved to Weekly Focus!').then(() => {
          audio.pause();
          audio.currentTime = 0;
        });
        this.resetTimer();
      },
      error: () => {
        audio.pause();
        audio.currentTime = 0;
        this.showNotification('Error', 'Could not save your session.', true);
        this.resetTimer();
      }
    });
  }
}