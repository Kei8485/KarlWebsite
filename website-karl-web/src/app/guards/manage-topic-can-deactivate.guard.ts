import { CanDeactivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ManageTopicPage } from '../pages/manage-topic/manage-topic.page';
import { NavigationLoadingService } from '../services/navigation-loading';

export const manageTopicCanDeactivateGuard: CanDeactivateFn<ManageTopicPage> = (
  component,
  _currentRoute,
  _currentState,
  nextState
) => {
  const router = inject(Router);
  const navigationLoading = inject(NavigationLoadingService);
  if (!component.hasUnsavedChangesForNavigation()) return true;

  return component.canDeactivate().then((canLeave) => {
    if (!canLeave) return false;

    navigationLoading.showAfterDelay();
    setTimeout(() => {
      void router.navigateByUrl(nextState.url).catch((error: unknown) => {
        navigationLoading.hide();
        console.error('Could not continue navigation after discarding topic changes:', error);
      });
    });
    return false;
  });
};
