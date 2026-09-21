import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppButtonComponent } from '../../atoms/app-button/app-button.component';
import { arrowForwardOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';


@Component({
  selector: 'app-topic-card',
  templateUrl: './topic-card.component.html',
  styleUrls: ['./topic-card.component.scss'],
  standalone: true,
  imports: [CommonModule, AppButtonComponent,]
})
export class TopicCardComponent {
  @Input() topic: any;
  @Input() index: number = 0;

  constructor(){
    addIcons({arrowForwardOutline})
  }
}