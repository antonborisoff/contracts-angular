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
  HttpErrorResponse
} from '@angular/common/http'
import {
  throwBackendError,
  throwGeneralError
} from '../../tests/utils'

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

  it('processError - display translated error message in message box', () => {
    throwBackendError().pipe(service.processError()).subscribe()

    expect(messageBoxServiceMock.error).toHaveBeenCalledWith('Something went wrong.')
  })

  it('processError - complete stream on error', () => {
    const results: string[] = []
    throwBackendError().pipe(service.processError()).subscribe({
      next: () => results.push('next'),
      complete: () => results.push('completed')
    })

    expect(results.length).toBe(1)
    expect(results).toContain('completed')
  })

  it('processError - ignore errors based on not-status code', () => {
    let actualError: HttpErrorResponse | undefined
    throwBackendError(403).pipe(service.processError({
      not: {
        status: 403
      }
    })).subscribe({
      error: error => actualError = error
    })
    expect(messageBoxServiceMock.error).not.toHaveBeenCalled()
    expect(actualError?.status).toBe(403)
  })

  it('processError - process errors based on not-status code', () => {
    let actualError: HttpErrorResponse | undefined
    throwBackendError(500).pipe(service.processError({
      not: {
        status: 403
      }
    })).subscribe({
      error: error => actualError = error
    })
    expect(messageBoxServiceMock.error).toHaveBeenCalledWith('Something went wrong.')
    expect(actualError).toBeUndefined()
  })

  it('processError - process all errors if options missing', () => {
    let actualError: Error | undefined
    // we use general Error since then error instance doesn't have 'status' property
    throwGeneralError().pipe(service.processError()).subscribe({
      error: error => actualError = error
    })
    expect(messageBoxServiceMock.error).toHaveBeenCalledWith('Something went wrong.')
    expect(actualError).toBeUndefined()
  })

  it('processError - process all errors if options "not" missing', () => {
    let actualError: Error | undefined
    // we use general Error since then error instance doesn't have 'status' property
    throwGeneralError().pipe(service.processError({})).subscribe({
      error: error => actualError = error
    })
    expect(messageBoxServiceMock.error).toHaveBeenCalledWith('Something went wrong.')
    expect(actualError).toBeUndefined()
  })
})
