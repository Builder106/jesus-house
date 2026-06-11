import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    title: 'RCCG Jesus House, Middletown — Sundays 9:00 AM',
  },
  {
    path: 'visit',
    loadComponent: () => import('./features/visit/visit').then((m) => m.Visit),
    title: 'Plan a Visit — RCCG Jesus House, Middletown',
  },
];
