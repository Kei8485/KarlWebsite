import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular';
import { AppButtonComponent } from '../../components/atoms/app-button/app-button.component';
import { AppInputComponent } from '../../components/atoms/app-input/app-input.component';
import { IonIcon, IonInput } from "@ionic/angular";

@Component({
  selector: 'app-dev-preview',
  templateUrl: './dev-preview.page.html',
  styleUrls: ['./dev-preview.page.scss'],
  standalone: true,
  imports: [IonInput, IonIcon, CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, AppButtonComponent, AppInputComponent]

})
export class DevPreviewPage {
    email: string = '';
    password: string = '';

}
