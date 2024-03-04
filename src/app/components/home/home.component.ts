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
  RouterLink
} from '@angular/router'
import {
  CommonModule
} from '@angular/common'
import {
  FeatureToggleService
} from '../../services/features/feature-toggle.service'

const COMPONENT_TRANSLOCO_SCOPE = 'home'
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TranslocoPipe,
    CommonModule,
    RouterLink
  ],
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

  public constructor(public ft: FeatureToggleService) {}
}
