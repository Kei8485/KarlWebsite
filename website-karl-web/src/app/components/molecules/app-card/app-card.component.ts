import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  templateUrl: './app-card.component.html',
  styleUrls: ['./app-card.component.scss'],
  standalone: true,  
  imports: [CommonModule]  
})
export class AppCardComponent {
  constructor() { }
}