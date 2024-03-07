import {
  Component
} from '@angular/core'
import {
  Translation,
  TranslocoPipe,
  provideTranslocoScope
} from '@ngneat/transloco'
import {
  getTranslocoInlineLoader
} from '../../../transloco/transloco-loaders'
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import {
  requiredAfterTrimValidator
} from '../../validators'
import {
  AuthService
} from '../../services/auth/auth.service'
import {
  Router
} from '@angular/router'
import {
  BackendErrorHandlerService
} from '../../services/backend-error-handler/backend-error-handler.service'
import {
  EMPTY,
  catchError
} from 'rxjs'

const COMPONENT_TRANSLOCO_SCOPE = 'login'
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    TranslocoPipe,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [provideTranslocoScope({
    scope: COMPONENT_TRANSLOCO_SCOPE,
    loader: getTranslocoInlineLoader((lang: string) => (): Promise<Translation> => import(`./i18n/${lang}.json`))
  })]
})
export class LoginComponent {
  public static getTranslocoScope(): string {
    return COMPONENT_TRANSLOCO_SCOPE
  }

  public loginForm
  public incorrectLoginOrPassword = false
  public constructor(
    private fb: FormBuilder,
    private auth$: AuthService,
    private backendErrorHandler: BackendErrorHandlerService,
    private router: Router
  ) {
    this.loginForm = this.fb.nonNullable.group({
      login: [
        '',
        [requiredAfterTrimValidator()]
      ],
      password: [
        '',
        [Validators.required]
      ]
    }, {
      updateOn: 'blur'
    })
  }

  public onLogin(): void {
    this.incorrectLoginOrPassword = false
    this.auth$.login(this.loginForm.controls.login.value, this.loginForm.controls.password.value).pipe(
      this.backendErrorHandler.processError({
        not: {
          status: 403
        }
      }),
      catchError(() => {
        this.incorrectLoginOrPassword = true
        return EMPTY
      })
    ).subscribe(() => {
      this.router.navigate(['/home'])
    })
  }
}
