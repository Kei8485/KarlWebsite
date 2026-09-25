import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { adminGuard } from './guards/admin-guard';
const routes: Routes = [ 
  // pag gagawa ng bagong page gagawing loadComponent tas gagawing Page ung dulo
 {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  // {
  //   path: 'dev-preview',
  //   loadComponent: () => import('./pages/dev-preview/dev-preview.page').then( m => m.DevPreviewPage)
  // },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'subjects',
    loadComponent: () => import('./pages/subjects/subjects.page').then(m => m.SubjectsPage)
  },
  {
    path: 'topic-tree/:id',
    loadComponent: () => import('./pages/topic-tree/topic-tree.page').then( m => m.TopicTreePage)
  },
  {
    path: 'manage-users',
    loadComponent: () => import('./pages/manage-users/manage-users.page').then( m => m.ManageUsersPage),
    canActivate: [adminGuard] 
  },
  {
    path: 'topic-detail/:id',
    loadComponent: () => import('./pages/topic-detail/topic-detail.page').then( m => m.TopicDetailPage)
  },
  {
    path: 'planner',
     loadComponent: () => import('./pages/planner/planner.page').then( m => m.PlannerPage)
  },  {
    path: 'manage-topic/:subjectId/:topicId',
    loadComponent: () => import('./pages/manage-topic/manage-topic.page').then( m => m.ManageTopicPage)
  }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
