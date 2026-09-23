import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonDatetime, IonModal, IonButton, IonButtons } from '@ionic/angular';
import { AppButtonComponent } from '../../atoms/app-button/app-button.component';
import { AppInputComponent } from '../../atoms/app-input/app-input.component';
import { addIcons } from 'ionicons';
import { mailOutline, timeOutline, calendarOutline } from 'ionicons/icons';

@Component({
  selector: 'app-schedule-study',
  templateUrl: './schedule-study.component.html',
  styleUrls: ['./schedule-study.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon, IonDatetime, IonModal, IonButton, IonButtons, AppButtonComponent, AppInputComponent]
})
export class ScheduleStudyComponent implements OnInit {
  scheduleTitle: string = '';
  scheduleSubject: string = '';
  scheduleDate: string = new Date().toISOString();
  todayDate: string = new Date().toISOString();

  constructor() {
    addIcons({ mailOutline, timeOutline, calendarOutline });
  }

  ngOnInit() {}

  saveSchedule() {
    // We will connect this to the Django backend later!
    console.log("Saving schedule:", this.scheduleTitle, this.scheduleSubject, this.scheduleDate);
  }
}
