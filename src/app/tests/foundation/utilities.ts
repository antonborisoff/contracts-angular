import {
  HarnessLoader
} from '@angular/cdk/testing'
import {
  TestbedHarnessEnvironment
} from '@angular/cdk/testing/testbed'
import {
  Location
} from '@angular/common'
import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing'
import {
  MessageType
} from '../../services/message-box/interfaces'
import {
  MatDialogHarness
} from '@angular/material/dialog/testing'

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

export class MessageBoxUtils {
  private documentRootLoader: HarnessLoader
  public constructor(private fixture: ComponentFixture<unknown>) {
    this.documentRootLoader = TestbedHarnessEnvironment.documentRootLoader(this.fixture)
  }

  public async present(type: MessageType, message?: string): Promise<boolean> {
    const messageBoxDialog = await this.documentRootLoader.getHarnessOrNull(MatDialogHarness.with({
      selector: `#${type}MessageBox`
    }).addOption('message', message, async (harness, message): Promise<boolean> => {
      const actualMessage = await harness.getContentText()
      return actualMessage === message
    }))
    return !!messageBoxDialog
  }
}
