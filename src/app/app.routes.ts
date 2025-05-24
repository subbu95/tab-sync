import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'dashboard', loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashBoardComponent), canActivate: [authGuard]  },
  { path: 'login', loadComponent: () => import('./modules/login-page/login-page.component').then(m => m.LoginPageComponent)},
  {
    path: 'follow-up',
    loadChildren: () => import('./modules/follow-up/follow-up.module').then(m => m.FollowUpModule),
    canActivate: [authGuard]
  },
  {
    path: 'building-blocks',
    loadChildren: () => import('./modules/building-blocks/building-blocks.module').then(m => m.BuildingBlocksModule),
    canActivate: [authGuard]
  },
  { path: 'legacy', loadComponent: () => import('./modules/legacy/legacy.component').then(m => m.LegacyComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }, // Fallback route for unknown paths 
];
