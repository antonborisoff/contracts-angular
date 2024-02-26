import {
  Component
} from '@angular/core'
import {
  Translation,
  TranslocoPipe,
  TranslocoService,
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
  HttpErrorResponse
} from '@angular/common/http'
import {
  Router
} from '@angular/router'
import {
  MessageBoxService
} from '../../services/message-box/message-box.service'

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
    private messageBox: MessageBoxService,
    private translocoService: TranslocoService,
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
    this.auth$.login(this.loginForm.controls.login.value, this.loginForm.controls.password.value).subscribe({
      next: () => {
        this.router.navigate(['/home'])
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 403) {
          this.incorrectLoginOrPassword = true
        }
        else {
          this.messageBox.error(this.translocoService.translate(`${COMPONENT_TRANSLOCO_SCOPE}.GENERAL_ERROR_MESSAGE`))
        }
      }
    })
  }
}
