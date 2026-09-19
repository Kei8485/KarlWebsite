import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular';

@Component({
  selector: 'app-button',
  templateUrl: './app-button.component.html',
  styleUrls: ['./app-button.component.scss'],
  standalone: true,
  imports: [IonIcon, CommonModule, IonButton]
})
export class AppButtonComponent {
  @Input() label: string = 'Button';
  @Input() variant: 'primary' | 'outline' | 'transparent' = 'primary';
  @Input() disabled: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() icon: string = '';           
  @Input() iconPosition: 'start' | 'end' = 'end';
  @Output() clicked = new EventEmitter<void>();
}