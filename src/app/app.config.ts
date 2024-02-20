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
  provideHttpClient
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

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: SUPPORTED_LANGUAGES,
        defaultLang: DEFAULT_LANGUAGE,
        reRenderOnLangChange: false,
        prodMode: !isDevMode()
      },
      loader: TranslocoHttpLoader
    })
  ]
}
