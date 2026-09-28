import { Component, ChangeDetectorRef } from '@angular/core'; // <-- Import ChangeDetectorRef
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet, ModalController } from '@ionic/angular';
import { AppHeaderComponent } from './components/organisms/app-header/app-header.component';
import { ConfirmModalComponent } from './components/molecules/confirm-modal/confirm-modal.component';
import { FocusTimerService } from './services/focus-timer';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [CommonModule, IonApp, IonRouterOutlet, AppHeaderComponent]
})
export class AppComponent {
  showHeader = false;

  constructor(
    public router: Router,
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
    private focusTimer: FocusTimerService
  ) {
     this.showHeader = !window.location.pathname.includes('/login');

     this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        
        this.showHeader = !event.urlAfterRedirects.includes('/login');
        
         
        this.cdr.detectChanges(); 
      }
    });

    this.focusTimer.timerCompleted$.subscribe((completion) => {
      void this.showTimerCompletion(completion.minutes, completion.saved);
    });
  }

  private async showTimerCompletion(minutes: number, saved: boolean): Promise<void> {
    const title = saved ? "Time's Up! 🎉" : 'Session Save Failed';
    const message = saved
      ? `Amazing work! Your full ${minutes}-minute session has been saved to Weekly Focus.`
      : 'Your timer finished, but the session could not be saved. Please check your connection.';

    try {
      const modal = await this.modalCtrl.create({
        component: ConfirmModalComponent,
        cssClass: 'transparent-modal',
        componentProps: {
          title,
          message,
          confirmText: 'OK',
          cancelText: '',
          isDanger: !saved
        }
      });
      await modal.present();
      await modal.onWillDismiss();
      this.focusTimer.resetTimer();
    } catch (error) {
      console.error('Could not show focus timer completion notification:', error);
    }
  }
}