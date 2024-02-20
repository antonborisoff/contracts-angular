import {
  Component
} from '@angular/core'
import {
  RouterOutlet
} from '@angular/router'
import {
  TranslocoPipe,
  provideTranslocoScope
} from '@ngneat/transloco'
import {
  getTranslocoInlineLoader
} from '../transloco/transloco-loaders'

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
    loader: getTranslocoInlineLoader((lang: string) => () => import(`./i18n/${lang}.json`))
  })]
})
export class AppComponent {
  title = 'contracts-angular'

  static getTranslocoScope() {
    return COMPONENT_TRANSLOCO_SCOPE
  }
}
