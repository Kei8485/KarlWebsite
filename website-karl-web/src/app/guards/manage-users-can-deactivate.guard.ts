import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ManageUsersPage } from '../pages/manage-users/manage-users.page';
import { NavigationLoadingService } from '../services/navigation-loading';

export const manageUsersCanDeactivateGuard: CanDeactivateFn<ManageUsersPage> = (component) => {
  const navigationLoading = inject(NavigationLoadingService);
  if (!component.hasUnsavedChangesForNavigation()) return true;

  return component.canDeactivate().then((canLeave) => {
    if (!canLeave) return false;

    navigationLoading.showAfterDelay();
    return true;
  });
};
