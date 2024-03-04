import {
  TestBed
} from '@angular/core/testing'

import {
  BackendErrorHandlerService
} from './backend-error-handler.service'
import {
  MessageBoxService
} from '../message-box/message-box.service'
import {
  getTranslocoTestingModuleForService
} from '../../../transloco/transloco-testing'
import en from '../../../assets/i18n/en.json'

describe('BackendErrorHandlerService', () => {
  let messageBoxServiceMock: jasmine.SpyObj<MessageBoxService>
  let service: BackendErrorHandlerService

  beforeEach(() => {
    messageBoxServiceMock = jasmine.createSpyObj('messageBox', ['error'])

    TestBed.configureTestingModule({
      imports: [getTranslocoTestingModuleForService(en)],
      providers: [{
        provide: MessageBoxService,
        useValue: messageBoxServiceMock
      }]
    })
    service = TestBed.inject(BackendErrorHandlerService)
  })

  it('handleError - display translated error message in message box', () => {
    service.handleError()

    expect(messageBoxServiceMock.error).toHaveBeenCalledWith('Something went wrong.')
  })
})
