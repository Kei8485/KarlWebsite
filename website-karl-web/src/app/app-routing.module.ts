import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';
const routes: Routes = [ 
  // pag gagawa ng bagong page gagawing loadComponent tas gagawing Page ung dulo
 {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'subjects',
    loadComponent: () => import('./pages/subjects/subjects.page').then(m => m.SubjectsPage),
    canActivate: [authGuard]
  },
  {
    path: 'topic-tree/:id',
    loadComponent: () => import('./pages/topic-tree/topic-tree.page').then( m => m.TopicTreePage),
    canActivate: [authGuard]
  },
  {
    path: 'manage-users',
    loadComponent: () => import('./pages/manage-users/manage-users.page').then( m => m.ManageUsersPage),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'topic-detail/:id',
    loadComponent: () => import('./pages/topic-detail/topic-detail.page').then( m => m.TopicDetailPage),
    canActivate: [authGuard]
  },
  {
    path: 'planner',
     loadComponent: () => import('./pages/planner/planner.page').then( m => m.PlannerPage),
     canActivate: [authGuard]
  },
  {
    path: 'manage-topic/:subjectId/:topicId',
    loadComponent: () => import('./pages/manage-topic/manage-topic.page').then( m => m.ManageTopicPage),
    canActivate: [authGuard, adminGuard]
  },
  {
  path: 'community',
  loadComponent: () => import('./pages/community/community.page').then(m => m.CommunityPage),
  canActivate: [authGuard]
  },



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
