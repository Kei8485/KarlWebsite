import { CanDeactivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ManageUsersPage } from '../pages/manage-users/manage-users.page';

export const manageUsersCanDeactivateGuard: CanDeactivateFn<ManageUsersPage> = (
  component,
  _currentRoute,
  _currentState,
  nextState
) => {
  const router = inject(Router);
  if (!component.hasUnsavedChangesForNavigation()) return true;

  return component.canDeactivate().then((canLeave) => {
    if (!canLeave) return false;

    setTimeout(() => {
      void router.navigateByUrl(nextState.url).catch((error: unknown) => {
        console.error('Could not continue navigation after discarding subject changes:', error);
      });
    });
    return false;
  });
};
