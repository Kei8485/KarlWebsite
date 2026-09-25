import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const role = localStorage.getItem('userRole');
  const token = localStorage.getItem('authToken');

  if (token && role === 'admin') {
    return true; // Let them in!
  } else {
    router.navigate(['/subjects']); // Kick them out!
    return false;
  }
};