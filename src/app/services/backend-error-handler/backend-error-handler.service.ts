import {
  Injectable
} from '@angular/core'
import {
  MessageBoxService
} from '../message-box/message-box.service'
import {
  TranslocoService
} from '@ngneat/transloco'

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
}
