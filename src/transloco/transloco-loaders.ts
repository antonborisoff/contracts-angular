import {
  Injectable
} from '@angular/core'
import {
  InlineLoader,
  Translation,
  TranslocoLoader
} from '@ngneat/transloco'
import {
  HttpClient
} from '@angular/common/http'
import {
  SUPPORTED_LANGUAGES
} from './transloco-languages'
import {
  Observable
} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class TranslocoHttpLoader implements TranslocoLoader {
  public constructor(private http: HttpClient) {}

  public getTranslation(lang: string): Observable<Translation> {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`)
  }
}

export function getTranslocoInlineLoader(getLanguageLoader: (lang: string) => (() => Promise<Translation>)): InlineLoader {
  return SUPPORTED_LANGUAGES.reduce<InlineLoader>((acc: InlineLoader, lang: string) => {
    acc[lang] = getLanguageLoader(lang)
    return acc
  }, {} as InlineLoader)
}
