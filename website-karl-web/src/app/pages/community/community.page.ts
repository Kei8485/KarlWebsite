import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logoFacebook, peopleOutline, openOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-community',
  templateUrl: './community.page.html',
  styleUrls: ['./community.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon]
})
export class CommunityPage {
  gcLink = 'https://www.facebook.com/';

  constructor() {
    addIcons({ logoFacebook, peopleOutline, openOutline });
  }

  openGC() {
    window.open(this.gcLink, '_blank');
  }
}