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
  MatIconModule
} from '@angular/material/icon'

const COMPONENT_TRANSLOCO_SCOPE = 'notFound'
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    TranslocoPipe,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
  providers: [provideTranslocoScope({
    scope: COMPONENT_TRANSLOCO_SCOPE,
    loader: getTranslocoInlineLoader((lang: string) => (): Promise<Translation> => import(`./i18n/${lang}.json`))
  })]
})
export class NotFoundComponent {
  public static getTranslocoScope(): string {
    return COMPONENT_TRANSLOCO_SCOPE
  }
}
