import { Component, Input, inject  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppButtonComponent } from '../../atoms/app-button/app-button.component';
import { arrowForwardOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-topic-card',
  templateUrl: './topic-card.component.html',
  styleUrls: ['./topic-card.component.scss'],
  standalone: true,
  imports: [CommonModule, AppButtonComponent, RouterModule]
})
export class TopicCardComponent {
  @Input() topic: any;
  @Input() index: number = 0;
  
  private router = inject(Router);

  constructor(){
    addIcons({arrowForwardOutline})
  }

  goToTopic() {
    // Navigate to the topic detail page!
    if (this.topic && this.topic.id) {
      this.router.navigate(['/topic-detail', this.topic.id]);
    } else {
      // Fallback for dummy data testing
      this.router.navigate(['/topic-detail', 1]);
    }
  }
}