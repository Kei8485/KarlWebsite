import { Component, ChangeDetectorRef } from '@angular/core'; // <-- Import ChangeDetectorRef
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { AppHeaderComponent } from './components/organisms/app-header/app-header.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [CommonModule, IonApp, IonRouterOutlet, AppHeaderComponent]
})
export class AppComponent {
  showHeader = false;

  constructor(public router: Router, private cdr: ChangeDetectorRef) {
     this.showHeader = !window.location.pathname.includes('/login');

     this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        
        this.showHeader = !event.urlAfterRedirects.includes('/login');
        
         
        this.cdr.detectChanges(); 
      }
    });
  }
}