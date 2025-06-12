import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'cv-search',
    loadComponent: () =>
      import('./features/pages/cv-search/cv-search.component').then(
        (c) => c.CvSearchComponent
      ),
    canActivate: [AuthGuard],
  },
    {
    path: '',
    loadComponent: () =>
      import('./features/pages/home/home.component').then(
        (c) => c.HomeComponent
      ),
    canActivate: [AuthGuard],
  },
];
