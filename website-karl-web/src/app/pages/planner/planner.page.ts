import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon, IonDatetime, IonDatetimeButton, IonModal, ModalController, IonPicker, IonPickerColumn, IonPickerColumnOption } from '@ionic/angular';
import { PlannerService } from '../../services/planner'; 
import { AppHeaderComponent } from '../../components/organisms/app-header/app-header.component';
import { ConfirmModalComponent } from '../../components/molecules/confirm-modal/confirm-modal.component';
import { AppButtonComponent } from '../../components/atoms/app-button/app-button.component'; // 🚨 Left this exactly as you had it!
import { addIcons } from 'ionicons';
// 🚨 MOVED THE 2 NEW ICONS HERE:
import { checkmarkCircleOutline, ellipseOutline, trashOutline, playOutline, squareOutline, refreshOutline, timeOutline, addOutline, calendarOutline, swapVerticalOutline } from 'ionicons/icons';


@Component({
  selector: 'app-planner',
  templateUrl: './planner.page.html',
  styleUrls: ['./planner.page.scss'],
  standalone: true,
  // 🚨 REMOVED the icons from this array (only components go here!)
  imports: [IonContent, IonButton, IonIcon, IonDatetime, IonDatetimeButton, IonModal, IonPicker, IonPickerColumn, IonPickerColumnOption, CommonModule, FormsModule, AppHeaderComponent, AppButtonComponent]
})
export class PlannerPage implements OnInit, OnDestroy {
  
  currentUserId: number = 1; 
  totalStudyTime: string = '0h 0m';
  tasks: any[] = [];
  
  // 🚨 NEW: Task Form & Sorting State
  isAddingTask: boolean = false;
  sortOrder: 'asc' | 'desc' = 'asc';
  newTaskTitle: string = '';
  newTaskSubject: string = '';
  newTaskDate: string = new Date().toISOString();
  
  timerMinutes: number = 30; 
  timeLeft: number = 30 * 60; 
  timerInterval: any;
  isTimerRunning: boolean = false;
  displayTime: string = '30:00';
  inputHours: number = 0;
  inputMinutes: number = 30;
  inputSeconds: number = 0;
  hoursList = Array.from({ length: 100 }, (_, i) => i);
  minsList = Array.from({ length: 60 }, (_, i) => i);
  secsList = Array.from({ length: 60 }, (_, i) => i);
  constructor(
    private plannerService: PlannerService,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController
  ) {
    addIcons({ checkmarkCircleOutline, ellipseOutline, trashOutline, playOutline, squareOutline, refreshOutline, timeOutline, addOutline, calendarOutline, swapVerticalOutline });
  }
  ngOnInit() {
    const storedId = localStorage.getItem('userId');
    if (storedId) this.currentUserId = parseInt(storedId, 10);
    this.loadTasks();
    this.loadStats();
  }
  ngOnDestroy() {
    this.stopTimer(); 
  }
  // ==========================================
  // 1. TASKS LOGIC (WITH NEW SORTING)
  // ==========================================
  
  // 🚨 NEW: Dynamically sorts tasks by date
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
  addTask() {
    if (!this.newTaskTitle) return;
    const taskData = { title: this.newTaskTitle, subject: this.newTaskSubject, due_date: this.newTaskDate };
    this.plannerService.addTask(this.currentUserId, taskData).subscribe(() => {
      this.newTaskTitle = '';
      this.newTaskSubject = '';
      this.isAddingTask = false; // 🚨 Closes form automatically
      this.loadTasks(); 
    });
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
  startTimer() {
    if (this.isTimerRunning) return;
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
    this.timeLeft = this.timerMinutes * 60;
    this.updateDisplayTime();
  }
  updateDisplayTime() {
    const h = Math.floor(this.timeLeft / 3600);
    const m = Math.floor((this.timeLeft % 3600) / 60);
    const s = this.timeLeft % 60;
    this.displayTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  timerFinished() {
    this.stopTimer();
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
    audio.play();
    
    this.plannerService.saveStudySession(this.currentUserId, this.timerMinutes).subscribe(() => {
      this.loadStats(); 
      alert("Time's up! Great study session!"); 
      this.resetTimer();
    });
  }
}