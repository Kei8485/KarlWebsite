import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="loading-indicator"
      [class.loading-indicator--small]="size === 'small'"
      [class.loading-indicator--large]="size === 'large'"
      [attr.role]="label ? 'status' : null"
      [attr.aria-label]="label || null"
      [attr.aria-hidden]="label ? null : true"
    >
      <span class="loading-indicator__dots" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span *ngIf="label" class="loading-indicator__label">{{ label }}</span>
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    .loading-indicator {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      color: #aab6ca;
    }

    .loading-indicator__dots {
      display: inline-flex;
      height: 1.5rem;
      align-items: center;
      justify-content: center;
      gap: 0.28rem;
    }

    .loading-indicator__dots span {
      width: 0.42rem;
      height: 0.42rem;
      border-radius: 50%;
      background: #4facfe;
      animation: loading-indicator-pulse 0.9s ease-in-out infinite;
    }

    .loading-indicator__dots span:nth-child(2) {
      animation-delay: 0.15s;
    }

    .loading-indicator__dots span:nth-child(3) {
      animation-delay: 0.3s;
    }

    .loading-indicator__label {
      line-height: 1.5;
    }

    .loading-indicator--small .loading-indicator__dots {
      height: 1rem;
      gap: 0.18rem;
    }

    .loading-indicator--small .loading-indicator__dots span {
      width: 0.3rem;
      height: 0.3rem;
    }

    .loading-indicator--large .loading-indicator__dots {
      height: 2.75rem;
      gap: 0.45rem;
    }

    .loading-indicator--large .loading-indicator__dots span {
      width: 0.65rem;
      height: 0.65rem;
    }

    @keyframes loading-indicator-pulse {
      0%, 60%, 100% {
        opacity: 0.45;
        transform: scale(0.75);
      }

      30% {
        opacity: 1;
        transform: scale(1.2);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .loading-indicator__dots span {
        animation-duration: 2s;
      }
    }
  `]
})
export class LoadingIndicatorComponent {
  @Input() label = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
