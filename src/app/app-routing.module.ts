import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup.page').then(m => m.SignupPage)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule),
    canActivate: [authGuard]
  },
  {
    path: 'profile-settings',
    loadChildren: () => import('./profile-settings/profile-settings.module').then(m => m.ProfileSettingsPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'learning',
    loadChildren: () => import('./learning/learning.module').then(m => m.LearningPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'iot-ai-module',
    loadChildren: () => import('./iot-ai-module/iot-ai-module.module').then( m => m.IotAiModulePageModule),
    canActivate: [authGuard]
  },
  {
    path: 'code-editor',
    loadChildren: () => import('./code-editor/code-editor.module').then(m => m.CodeEditorPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'discuss',
    loadChildren: () => import('./discuss/discuss.module').then(m => m.DiscussPageModule),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      preloadingStrategy: PreloadAllModules,
      enableTracing: false
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
