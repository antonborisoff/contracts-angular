import {
  Component
} from '@angular/core'
import {
  Router,
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

const COMPONENT_TRANSLOCO_SCOPE = 'app'
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TranslocoPipe
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

  public constructor(
    private auth$: AuthService,
    private router: Router
  ) {}

  public onLogout(): void {
    this.auth$.logout().subscribe({
      next: () => {
        this.router.navigate(['/login'])
      },
      error: () => {
        // notify about the error
      }
    })
  }
}
