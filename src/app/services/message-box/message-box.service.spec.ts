import {
  TestBed
} from '@angular/core/testing'

import {
  MessageBoxService
} from './message-box.service'

describe('MessageBoxService', () => {
  let service: MessageBoxService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(MessageBoxService)
  })

  it('error displays errors properly', () => {
    const alertSpy = spyOn<typeof window, 'alert'>(window, 'alert')
    const consoleSpy = spyOn<typeof console, 'error'>(console, 'error')
    const errorMessage = 'some error'

    service.error(errorMessage)
    expect(alertSpy).toHaveBeenCalledWith(errorMessage)
    expect(consoleSpy).toHaveBeenCalledWith(errorMessage)
  })

  it('confirm displays confirmation properly', () => {
    const confirmSpy = spyOn<typeof window, 'confirm'>(window, 'confirm')
    const onHandleSpy = jasmine.createSpy('onHandle')
    const confirmMessage = 'Are you sure?'

    service.confirm(confirmMessage, onHandleSpy)
    expect(confirmSpy).toHaveBeenCalledWith(confirmMessage)
  })

  it('confirm executes onHandle with correct flag', () => {
    const confirmSpy = spyOn<typeof window, 'confirm'>(window, 'confirm')
    const onHandleSpy = jasmine.createSpy('onHandle')
    const confirmMessage = 'Are you sure?'

    confirmSpy.and.returnValue(true)
    service.confirm(confirmMessage, onHandleSpy)
    expect(onHandleSpy).toHaveBeenCalledWith(true)

    confirmSpy.and.returnValue(false)
    service.confirm(confirmMessage, onHandleSpy)
    expect(onHandleSpy).toHaveBeenCalledWith(false)
  })
})
