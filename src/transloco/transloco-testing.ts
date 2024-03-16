import {
  HashMap,
  Translation,
  TranslocoTestingModule,
  TranslocoTestingOptions
} from '@ngneat/transloco'
import {
  TranslocoLocalScope
} from './transloco-interfaces'
import {
  ModuleWithProviders
} from '@angular/core'
import {
  SUPPORTED_LANGUAGES
} from './transloco-languages'
import en from '../assets/i18n/en.json'
import ru from '../assets/i18n/ru.json'

export function getTranslocoTestingModule(componentClass: TranslocoLocalScope, componentTranslations: HashMap<Translation> = {}): ModuleWithProviders<TranslocoTestingModule> {
  const scope = componentClass.getTranslocoScope()
  const scopedTranslations: HashMap<Translation> = {}
  Object.keys(componentTranslations).forEach((lang) => {
    scopedTranslations[`${scope}/${lang}`] = componentTranslations[lang]
  })
  return TranslocoTestingModule.forRoot(getForRootConfig(scopedTranslations))
}

export function getTranslocoTestingModuleForService(): ModuleWithProviders<TranslocoTestingModule> {
  return TranslocoTestingModule.forRoot(getForRootConfig())
}

function getForRootConfig(translations?: HashMap<Translation>): TranslocoTestingOptions {
  const globalTranslations = {
    en: en,
    ru: ru
  }
  const baseOptions: TranslocoTestingOptions = {
    langs: {
      ...translations,
      ...globalTranslations
    },
    translocoConfig: {
      defaultLang: 'en',
      availableLangs: SUPPORTED_LANGUAGES
    },
    preloadLangs: true
  }
  return baseOptions
}
