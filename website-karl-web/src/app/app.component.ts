import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { Router, NavigationCancel, NavigationEnd, NavigationError, NavigationStart } from '@angular/router';
import { IonApp, IonRouterOutlet, ModalController } from '@ionic/angular';
import { AppHeaderComponent } from './components/organisms/app-header/app-header.component';
import { ConfirmModalComponent } from './components/molecules/confirm-modal/confirm-modal.component';
import { LoadingIndicatorComponent } from './components/atoms/loading-indicator/loading-indicator.component';
import { FocusTimerService } from './services/focus-timer';
import { NavigationLoadingService } from './services/navigation-loading';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, AppHeaderComponent, LoadingIndicatorComponent]
})
export class AppComponent {
  showHeader = false;
  public router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private modalCtrl = inject(ModalController);
  private focusTimer = inject(FocusTimerService);
  private navigationLoading = inject(NavigationLoadingService);
  readonly isNavigationLoading = this.navigationLoading.isLoading;

  constructor() {
     this.showHeader = !window.location.pathname.includes('/login');

     this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showHeader = !event.urlAfterRedirects.includes('/login');
        this.navigationLoading.hide();
        this.cdr.detectChanges(); 
      } else if (event instanceof NavigationStart) {
        this.navigationLoading.navigationStarted();
      } else if (event instanceof NavigationCancel) {
        this.navigationLoading.scheduleHide();
      } else if (event instanceof NavigationError) {
        this.navigationLoading.hide();
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