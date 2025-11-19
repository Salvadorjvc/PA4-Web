import { Routes } from '@angular/router';
import { Login } from './paginas/login/login';
import { Mesero } from './paginas/mesero/mesero';
import { Cocinero } from './paginas/cocinero/cocinero';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'mesero', component: Mesero },
  { path: 'cocinero', component: Cocinero },
  { path: '**', redirectTo: '/login' }
];