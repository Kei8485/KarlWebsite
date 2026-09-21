import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { warningOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class ConfirmModalComponent {
  // These get passed in from whatever page opens the modal!
  @Input() title: string = 'Confirm';
  @Input() message: string = 'Are you sure you want to do this?';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() isDanger: boolean = false; // Makes the button and icon red if true

  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ warningOutline, checkmarkCircleOutline });
  }

  cancel() {
    this.modalCtrl.dismiss(false); // Tells the page they clicked Cancel
  }

  confirm() {
    this.modalCtrl.dismiss(true); // Tells the page they clicked Confirm!
  }
}