import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonInput, IonIcon } from '@ionic/angular';

@Component({
  selector: 'app-input',
  templateUrl: './app-input.component.html',
  styleUrls: ['./app-input.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonInput]
})
export class AppInputComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() value: string = '';
  @Input() disabled: boolean = false;
  @Input() errorMessage: string = '';
  @Input() icon: string = '';
  @Input() iconPosition: 'start' | 'end' = 'start';
  @Output() valueChange = new EventEmitter<string>();

  showPassword: boolean = false;

  onInput(event: any) {
    this.valueChange.emit(event.target.value);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  get inputType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }
}