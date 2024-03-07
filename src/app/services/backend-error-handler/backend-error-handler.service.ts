import {
  Injectable
} from '@angular/core'
import {
  MessageBoxService
} from '../message-box/message-box.service'
import {
  TranslocoService
} from '@ngneat/transloco'
import {
  EMPTY,
  MonoTypeOperatorFunction,
  Observable,
  catchError,
  throwError
} from 'rxjs'
import {
  HttpErrorResponse
} from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class BackendErrorHandlerService {
  public constructor(
    private translocoService: TranslocoService,
    private messageBox: MessageBoxService
  ) { }

  public handleError(): void {
    this.messageBox.error(this.translocoService.translate('GENERAL_ERROR_MESSAGE'))
  }

  public processError<T>(options?: {
    not?: {
      status?: number
    }
  }): MonoTypeOperatorFunction<T> {
    const handleError = this.handleError.bind(this)
    return function<T>(source: Observable<T>): Observable<T> {
      return source.pipe(
        catchError((error: HttpErrorResponse) => {
          if (options?.not?.status === error.status) {
            return throwError(() => error)
          }
          else {
            handleError()
            return EMPTY
          }
        })
      )
    }
  }
}
