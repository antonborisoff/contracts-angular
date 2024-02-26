import {
  Routes
} from '@angular/router'
import {
  HomeComponent
} from './components/home/home.component'
import {
  LoginComponent
} from './components/login/login.component'
import {
  NotFoundComponent
} from './components/not-found/not-found.component'
import {
  authCanActivateGuard
} from './guards/auth.can-activate.guard'

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    canActivate: [authCanActivateGuard],
    component: HomeComponent
  },
  {
    path: 'login',
    canActivate: [authCanActivateGuard],
    component: LoginComponent
  },
  {
    path: '**',
    canActivate: [authCanActivateGuard],
    component: NotFoundComponent
  }
]
