import {
  Location
} from '@angular/common'
import {
  TestBed
} from '@angular/core/testing'

export class Utilities {
  public static async actOnMessageBox(actions: () => Promise<void>, action: 'confirm' | 'cancel'): Promise<void> {
    const windowConfirmOriginal = window.confirm
    /* eslint-disable-next-line jasmine/no-unsafe-spy */
    const confirmSpy = spyOn<typeof window, 'confirm'>(window, 'confirm')
    if (action === 'confirm') {
      confirmSpy.and.returnValue(true)
    }
    if (action === 'cancel') {
      confirmSpy.and.returnValue(false)
    }

    await actions()

    // restore window.confirm manually since Jasmine doesn't provide unspy method
    window.confirm = windowConfirmOriginal
  }

  public static async errorMessageBoxPresent(actions: () => Promise<void>): Promise<boolean> {
    const windowAlertOriginal = window.alert
    /* eslint-disable-next-line jasmine/no-unsafe-spy */
    const errorSpy = spyOn<typeof window, 'alert'>(window, 'alert')

    await actions()

    // restore window.alert manually since Jasmine doesn't provide unspy method
    window.alert = windowAlertOriginal

    return errorSpy.calls.any()
  }

  public static getLocationPath(): string {
    const location = TestBed.inject(Location)
    return location.path()
  }
}
