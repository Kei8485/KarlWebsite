import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// 1. Import provideIonicAngular instead of IonicModule
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular'; 

import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    
    // 2. THIS IS THE MAGIC FUNCTION THAT TURNS ON STANDALONE STYLING!
    provideIonicAngular(), 
    
    importProvidersFrom(AppRoutingModule, HttpClientModule)
  ],
}).catch(err => console.log(err));