import {
  Component
} from '@angular/core'
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router'
import {
  Translation,
  TranslocoPipe,
  provideTranslocoScope
} from '@ngneat/transloco'
import {
  getTranslocoInlineLoader
} from '../transloco/transloco-loaders'
import {
  AuthService
} from './services/auth/auth.service'
import {
  AsyncPipe
} from '@angular/common'
import {
  Observable
} from 'rxjs'
import {
  BackendErrorHandlerService
} from './services/backend-error-handler/backend-error-handler.service'
import {
  MatToolbarModule
} from '@angular/material/toolbar'
import {
  MatButtonModule
} from '@angular/material/button'

const COMPONENT_TRANSLOCO_SCOPE = 'app'
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TranslocoPipe,
    AsyncPipe,
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [provideTranslocoScope({
    scope: COMPONENT_TRANSLOCO_SCOPE,
    loader: getTranslocoInlineLoader((lang: string) => (): Promise<Translation> => import(`./i18n/${lang}.json`))
  })]
})
export class AppComponent {
  public static getTranslocoScope(): string {
    return COMPONENT_TRANSLOCO_SCOPE
  }

  public title = 'contracts-angular'
  public isAuth: Observable<boolean>

  public constructor(
    private auth$: AuthService,
    private backendErrorHandler: BackendErrorHandlerService,
    private router: Router
  ) {
    this.isAuth = this.auth$.isAuth()
  }

  public onLogout(): void {
    this.auth$.logout().pipe(this.backendErrorHandler.processError()).subscribe(() => {
      this.router.navigate(['/login'])
    })
  }
}
