import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ManageTopicPage } from '../pages/manage-topic/manage-topic.page';
import { NavigationLoadingService } from '../services/navigation-loading';

export const manageTopicCanDeactivateGuard: CanDeactivateFn<ManageTopicPage> = (component) => {
  const navigationLoading = inject(NavigationLoadingService);
  if (!component.hasUnsavedChangesForNavigation()) return true;

  return component.canDeactivate().then((canLeave) => {
    if (!canLeave) return false;

    navigationLoading.showAfterDelay();
    return true;
  });
};
