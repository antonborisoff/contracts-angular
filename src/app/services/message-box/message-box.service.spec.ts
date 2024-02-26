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
})
