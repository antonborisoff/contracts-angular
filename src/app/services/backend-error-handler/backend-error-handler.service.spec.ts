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
import {
  throwError
} from 'rxjs'

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

  it('processError - display translated error message in message box', () => {
    throwError(() => new Error()).pipe(service.processError()).subscribe()

    expect(messageBoxServiceMock.error).toHaveBeenCalledWith('Something went wrong.')
  })

  it('processError - complete stream on error', () => {
    const results: string[] = []
    throwError(() => new Error()).pipe(service.processError()).subscribe({
      next: () => results.push('next'),
      complete: () => results.push('completed')
    })

    expect(results.length).toBe(1)
    expect(results).toContain('completed')
  })
})
