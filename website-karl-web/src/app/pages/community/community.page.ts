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
  gcLink = 'https://www.messenger.com/cm/sgCTUr69Hw-UPmRw/?send_source=cm%3Adirect_invite_group&join_source=cm%3Axma';

  constructor() {
    addIcons({ logoFacebook, peopleOutline, openOutline });
  }

  openGC() {
    window.open(this.gcLink, '_blank');
  }
}