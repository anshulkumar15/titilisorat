import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
 
import { provideHttpClient, withFetch, withInterceptors, withJsonpSupport } from '@angular/common/http';

import { routes } from './app.routes';
// import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { authInterceptor } from './shared/auth/auth.interceptor';
import { provideToastr } from 'ngx-toastr';

 export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    provideAnimations(),
    provideToastr(), 
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
 