import {
  Translation,
  TranslocoTestingModule
} from '@ngneat/transloco'
import {
  TranslocoLocalScope
} from './transloco-interfaces'
import {
  ModuleWithProviders
} from '@angular/core'

export function getTranslocoTestingModule(componentClass: TranslocoLocalScope, translations: Translation): ModuleWithProviders<TranslocoTestingModule> {
  const testingLang = 'en'
  const scope = componentClass.getTranslocoScope()
  return TranslocoTestingModule.forRoot({
    langs: {
      [`${scope}/${testingLang}`]: translations
    },
    translocoConfig: {
      defaultLang: testingLang,
      availableLangs: [testingLang]
    },
    preloadLangs: true
  })
}
