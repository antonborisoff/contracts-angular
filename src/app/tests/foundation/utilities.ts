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
  MessageActions,
  MessageType
} from '../../services/message-box/interfaces'
import {
  MatDialogHarness
} from '@angular/material/dialog/testing'
import {
  MatButtonHarness
} from '@angular/material/button/testing'

export class Utilities {
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
    const messageBox = await this.documentRootLoader.getHarnessOrNull(MatDialogHarness.with({
      selector: `#${type}MessageBox`
    }).addOption('message', message, async (harness, message): Promise<boolean> => {
      const actualMessage = await harness.getContentText()
      return actualMessage === message
    }))
    return !!messageBox
  }

  public async act(action: MessageActions): Promise<void> {
    const messageBox = await this.documentRootLoader.getHarness(MatDialogHarness)
    const button = await messageBox.getHarness(MatButtonHarness.with({
      selector: `[data-id="${action}Button"]`
    }))
    await button.click()
  }
}
