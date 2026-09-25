import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';

// 1. Import provideIonicAngular instead of IonicModule
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular'; 

import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    
    // 2. THIS IS THE MAGIC FUNCTION THAT TURNS ON STANDALONE STYLING!
    provideIonicAngular(), 
    
    importProvidersFrom(AppRoutingModule, HttpClientModule),
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
}).catch(err => console.log(err));