import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
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
  @Input() variant: 'primary' | 'outline' | 'transparent' | 'muted' | 'danger' | 'danger-outline' = 'primary';
  @Input() disabled: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() icon: string = '';           
  @Input() iconPosition: 'start' | 'end' = 'end';
  @Output() clicked = new EventEmitter<void>();

  constructor(private hostElement: ElementRef<HTMLElement>) {}

  handleClick(event: Event): void {
    (event.currentTarget as HTMLElement | null)?.blur();
    this.hostElement.nativeElement.blur();
    setTimeout(() => this.hostElement.nativeElement.blur());
    this.clicked.emit();
  }
}