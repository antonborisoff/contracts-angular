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

const COMPONENT_TRANSLOCO_SCOPE = 'home'
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers: [provideTranslocoScope({
    scope: COMPONENT_TRANSLOCO_SCOPE,
    loader: getTranslocoInlineLoader((lang: string) => (): Promise<Translation> => import(`./i18n/${lang}.json`))
  })]
})
export class HomeComponent {
  public static getTranslocoScope(): string {
    return COMPONENT_TRANSLOCO_SCOPE
  }
}
