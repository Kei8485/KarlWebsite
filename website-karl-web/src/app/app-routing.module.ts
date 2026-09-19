import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

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
  // {
  //   path: 'subjects',
  //   loadComponent: () => import('./pages/subjects/subjects.page').then(m => m.SubjectsPage)
  // },
  // {
  // path: 'topic-detail/:id',
  // loadComponent: () => import('./pages/topic-detail/topic-detail.page').then(m => m.TopicDetailPage)
  // },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
