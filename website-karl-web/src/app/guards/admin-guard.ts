import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const role = localStorage.getItem('userRole');
  const token = localStorage.getItem('authToken');

  if (token && role === 'admin') {
    return true; // Let them in!
  }

  return router.createUrlTree([token ? '/subjects' : '/login']);
};