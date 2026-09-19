import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// 1. Import all the Ionic tags that the starter HTML template uses
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.page.html',
  styleUrls: ['./subjects.page.scss'],
  standalone: true, // 2. Tell Angular this page stands alone
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent] // 3. Add them here!
})
export class SubjectsPage {
  
}