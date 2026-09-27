import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');
  if (!token) return next(request);

  const authenticatedRequest = request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('email');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
