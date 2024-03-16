import {
  Component,
  OnInit
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
  TranslocoService,
  getBrowserLang,
  provideTranslocoScope
} from '@ngneat/transloco'
import {
  getTranslocoInlineLoader
} from '../transloco/transloco-loaders'
import {
  AuthService
} from './services/auth/auth.service'
import {
  AsyncPipe,
  CommonModule
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
import {
  MatIconModule
} from '@angular/material/icon'
import {
  MatMenuModule
} from '@angular/material/menu'
import {
  BusyDirective
} from './services/busy/busy.directive'
import {
  BusyStateService
} from './services/busy/busy-state.service'
import {
  SUPPORTED_LANGUAGES
} from '../transloco/transloco-languages'

const COMPONENT_TRANSLOCO_SCOPE = 'app'
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TranslocoPipe,
    AsyncPipe,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    BusyDirective
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [provideTranslocoScope({
    scope: COMPONENT_TRANSLOCO_SCOPE,
    loader: getTranslocoInlineLoader((lang: string) => (): Promise<Translation> => import(`./i18n/${lang}.json`))
  })]
})
export class AppComponent implements OnInit {
  public static getTranslocoScope(): string {
    return COMPONENT_TRANSLOCO_SCOPE
  }

  public isAuth: Observable<boolean>

  public supportedLanguages: string[] = SUPPORTED_LANGUAGES
  public activeLanguage: Observable<string> = this.transloco.langChanges$

  public constructor(
    private auth$: AuthService,
    private backendErrorHandler: BackendErrorHandlerService,
    private bs: BusyStateService,
    private transloco: TranslocoService,
    private router: Router
  ) {
    this.isAuth = this.auth$.isAuth()
  }

  public ngOnInit(): void {
    const browserLanguage = getBrowserLang()
    if (browserLanguage) {
      this.transloco.setActiveLang(browserLanguage)
    }
  }

  public onLogout(): void {
    this.auth$.logout().pipe(
      this.backendErrorHandler.processError(),
      this.bs.processLoading('logoutButton')
    ).subscribe(() => {
      this.router.navigate(['/login'])
    })
  }

  public languageSelected(language: string): void {
    this.transloco.setActiveLang(language)
  }
}
