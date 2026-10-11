import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { PlannerPage } from '../pages/planner/planner.page';
import { NavigationLoadingService } from '../services/navigation-loading';

export const plannerCanDeactivateGuard: CanDeactivateFn<PlannerPage> = (component) => {
  const navigationLoading = inject(NavigationLoadingService);
  if (!component.hasUnsavedChangesForNavigation()) return true;

  return component.canDeactivate().then((canLeave) => {
    if (!canLeave) return false;

    navigationLoading.showAfterDelay();
    return true;
  });
};
