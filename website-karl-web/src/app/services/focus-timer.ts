import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PlannerService } from './planner';

export interface FocusTimerCompletion {
  minutes: number;
  saved: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FocusTimerService {
  timerMinutes = 0;
  timeLeft = 0;
  originalTimeLeft = 0;
  isTimerRunning = false;
  displayTime = '00:00:00';
  inputHours = 0;
  inputMinutes = 0;
  inputSeconds = 0;

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private endTime = 0;
  private currentUserId: number | null = null;
  private alarm: HTMLAudioElement | null = null;
  private readonly completionSubject = new Subject<FocusTimerCompletion>();
  private readonly timerUpdatedSubject = new Subject<void>();
  readonly timerCompleted$ = this.completionSubject.asObservable();
  readonly timerUpdated$ = this.timerUpdatedSubject.asObservable();

  constructor(private plannerService: PlannerService) {}

  setCustomTime(minutes: number): void {
    this.stopTimer();
    this.inputHours = Math.floor(minutes / 60);
    this.inputMinutes = minutes % 60;
    this.inputSeconds = 0;
    this.timerMinutes = minutes;
    this.timeLeft = minutes * 60;
    this.updateDisplayTime();
  }

  onCustomTimeChange(): void {
    this.stopTimer();
    this.inputHours = Math.min(99, Math.max(0, this.inputHours || 0));
    this.inputMinutes = Math.min(59, Math.max(0, this.inputMinutes || 0));
    this.inputSeconds = Math.min(59, Math.max(0, this.inputSeconds || 0));
    this.timeLeft = (this.inputHours * 3600) + (this.inputMinutes * 60) + this.inputSeconds;
    this.timerMinutes = Math.round(this.timeLeft / 60);
    this.updateDisplayTime();
  }

  startTimer(userId: number): boolean {
    if (this.isTimerRunning || this.timeLeft <= 0) return false;

    this.currentUserId = userId;
    this.originalTimeLeft = this.timeLeft;
    this.endTime = Date.now() + this.timeLeft * 1000;
    this.isTimerRunning = true;
    this.timerInterval = setInterval(() => this.refreshCountdown(), 250);
    return true;
  }

  stopTimer(): void {
    this.isTimerRunning = false;
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetTimer(): void {
    this.stopTimer();
    this.stopAlarm();
    this.inputHours = 0;
    this.inputMinutes = 0;
    this.inputSeconds = 0;
    this.timerMinutes = 0;
    this.timeLeft = 0;
    this.originalTimeLeft = 0;
    this.updateDisplayTime();
  }

  stopAlarm(): void {
    if (!this.alarm) return;
    this.alarm.pause();
    this.alarm.currentTime = 0;
    this.alarm = null;
  }

  updateDisplayTime(): void {
    const hours = Math.floor(this.timeLeft / 3600);
    const minutes = Math.floor((this.timeLeft % 3600) / 60);
    const seconds = this.timeLeft % 60;
    const nextDisplayTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (nextDisplayTime !== this.displayTime) {
      this.displayTime = nextDisplayTime;
      this.timerUpdatedSubject.next();
    }
  }

  private refreshCountdown(): void {
    this.timeLeft = Math.max(0, Math.ceil((this.endTime - Date.now()) / 1000));
    this.updateDisplayTime();
    if (this.timeLeft === 0) {
      this.finishTimer();
    }
  }

  private finishTimer(): void {
    this.stopTimer();
    this.playAlarm();

    const minutes = this.timerMinutes;
    const userId = this.currentUserId;
    if (userId === null) {
      console.error('Cannot save focus timer session: user ID is unavailable.');
      this.completionSubject.next({ minutes, saved: false });
      return;
    }

    this.plannerService.saveStudySession(userId, minutes).subscribe({
      next: () => this.completionSubject.next({ minutes, saved: true }),
      error: (error: unknown) => {
        console.error('Could not save the completed focus timer session:', error);
        this.completionSubject.next({ minutes, saved: false });
      }
    });
  }

  private playAlarm(): void {
    this.stopAlarm();
    this.alarm = new Audio('/assets/audio/ssstik.io_1790134444520.mp3');
    this.alarm.loop = true;
    void this.alarm.play().catch((error: unknown) => {
      console.error('Could not play the focus timer alarm:', error);
    });
  }
}
