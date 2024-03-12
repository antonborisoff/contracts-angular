import {
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

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTransloco({
      config: {
        availableLangs: SUPPORTED_LANGUAGES,
        defaultLang: DEFAULT_LANGUAGE,
        reRenderOnLangChange: false,
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
    }
  ]
}
