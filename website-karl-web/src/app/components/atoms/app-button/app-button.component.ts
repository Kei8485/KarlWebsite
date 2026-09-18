import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton } from '@ionic/angular';

@Component({
  selector: 'app-button',
  templateUrl: './app-button.component.html',
  styleUrls: ['./app-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton]
})
export class AppButtonComponent {
  @Input() label: string = 'Button';
  @Input() variant: 'primary' | 'outline' = 'primary';
  @Input() disabled: boolean = false;
  @Output() clicked = new EventEmitter<void>();
}