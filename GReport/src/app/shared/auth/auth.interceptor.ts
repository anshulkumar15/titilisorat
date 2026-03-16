import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  let auth = inject(AuthService);
  const token = auth.getToken();
  request = request.clone({
    setHeaders: {
      Authorization:"Bearer " + token,
     
    },
    withCredentials: true
  });

  return next(request);
};
