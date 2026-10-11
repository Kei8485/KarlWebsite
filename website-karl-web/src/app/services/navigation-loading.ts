import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavigationLoadingService {
  readonly isLoading = signal(false);
  private showTimeout?: ReturnType<typeof setTimeout>;
  private hideTimeout?: ReturnType<typeof setTimeout>;

  showAfterDelay(delayMs = 1000): void {
    this.clearShowTimeout();
    this.clearHideTimeout();
    this.showTimeout = setTimeout(() => {
      this.showTimeout = undefined;
      this.isLoading.set(true);
    }, delayMs);
  }

  navigationStarted(): void {
    if (this.isLoading()) this.clearHideTimeout();
  }

  scheduleHide(): void {
    if (!this.isLoading()) return;

    this.clearHideTimeout();
    this.hideTimeout = setTimeout(() => this.hide(), 1200);
  }

  hide(): void {
    this.clearShowTimeout();
    this.clearHideTimeout();
    this.isLoading.set(false);
  }

  private clearShowTimeout(): void {
    if (this.showTimeout) clearTimeout(this.showTimeout);
    this.showTimeout = undefined;
  }

  private clearHideTimeout(): void {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.hideTimeout = undefined;
  }
}
