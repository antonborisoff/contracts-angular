import {
  APP_INITIALIZER,
  ApplicationConfig,
  isDevMode
} from '@angular/core'
import {
  provideRouter
} from '@angular/router'

import {
  routes
} from './app.routes'
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http'
import {
  TranslocoHttpLoader
} from '../transloco/transloco-loaders'
import {
  provideTransloco
} from '@ngneat/transloco'
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES
} from '../transloco/transloco-languages'
import {
  authInterceptor
} from './interceptors'
import {
  provideAnimationsAsync
} from '@angular/platform-browser/animations/async'
import {
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher
} from '@angular/material/core'
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS
} from '@angular/material/form-field'
import {
  MatPaginatorIntl
} from '@angular/material/paginator'
import {
  CustomMatPaginatorIntlService
} from '../transloco/custom-mat-paginator-intl.service'
import {
  NavigationBackService
} from './services/navigation-back/navigation-back.service'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTransloco({
      config: {
        availableLangs: SUPPORTED_LANGUAGES,
        defaultLang: DEFAULT_LANGUAGE,
        fallbackLang: DEFAULT_LANGUAGE,
        reRenderOnLangChange: true,
        prodMode: !isDevMode()
      },
      loader: TranslocoHttpLoader
    }),
    provideAnimationsAsync(),
    {
      provide: ErrorStateMatcher,
      useClass: ShowOnDirtyErrorStateMatcher
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline'
      }
    },
    {
      provide: MatPaginatorIntl,
      useClass: CustomMatPaginatorIntlService
    },
    {
      provide: APP_INITIALIZER,
      // we need to initialize it during app loading to make sure all navigation history is tracked;
      // we do it via APP_INITIALIZER that initializes the service as a dependency for dummy function;
      useFactory: () => () => {},
      multi: true,
      deps: [NavigationBackService]
    }
  ]
}
