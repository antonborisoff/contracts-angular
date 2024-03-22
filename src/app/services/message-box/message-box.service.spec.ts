import {
  TestBed
} from '@angular/core/testing'

import {
  MessageBoxService
} from './message-box.service'
import {
  ComponentHarnessAndUtils,
  TestComponent,
  TestComponentHarness,
  initComponentBase
} from '../../tests/utils'
import {
  MessageHarness
} from './component/message/message.component.hanress'

describe('MessageBoxService', () => {
  let service: MessageBoxService

  async function initTestComponent(): ComponentHarnessAndUtils<TestComponentHarness> {
    const res = await initComponentBase(TestComponent, TestComponentHarness, {})
    service = TestBed.inject(MessageBoxService)
    return res
  }

  it('error display test', async () => {
    const {
      harnesses
    } = await initTestComponent()
    const errorMessage = 'Error message for error message box'

    service.error(errorMessage)
    const errorMessageHarness = await harnesses.router.component.matDialogHarness('errorMessageBox', MessageHarness)

    await errorMessageHarness.expectElementClass('messageToolbar', 'error', true)
    await errorMessageHarness.expectElementText('messageIcon', 'report_problem')
    await errorMessageHarness.expectElementText('messageTitle', 'Error')
    await errorMessageHarness.expectElementText('message', errorMessage)

    await expectAsync(errorMessageHarness.elementChildCount('messageActions')).toBeResolvedTo(1)

    await errorMessageHarness.expectElementText('closeButton', 'Close')
    await errorMessageHarness.expectElementClass('closeButton', 'error', true)
    await errorMessageHarness.expectElementClass('closeButton', 'mat-mdc-raised-button', true)
  })

  it('error close test', async () => {
    const {
      harnesses
    } = await initTestComponent()
    const errorMessage = 'Error message for error message box'

    service.error(errorMessage)
    const messageBoxHarness = await harnesses.router.component.matDialogHarness('errorMessageBox', MessageHarness)

    await messageBoxHarness.clickElement('closeButton')
    await harnesses.router.component.expectMatDialogPresent('errorMessageBox', false)
  })

  it('confirm display test', async () => {
    const {
      harnesses
    } = await initTestComponent()
    const confirmMessage = 'Confirm message for confirm message box?'

    service.confirm(confirmMessage)
    const confirmMessageHarness = await harnesses.router.component.matDialogHarness('confirmMessageBox', MessageHarness)

    await confirmMessageHarness.expectElementClass('messageToolbar', 'confirm', true)
    await confirmMessageHarness.expectElementText('messageIcon', 'help_outline')
    await confirmMessageHarness.expectElementText('messageTitle', 'Please, confirm')
    await confirmMessageHarness.expectElementText('message', confirmMessage)

    await expectAsync(confirmMessageHarness.elementChildCount('messageActions')).toBeResolvedTo(2)

    await confirmMessageHarness.expectElementText('cancelButton', 'Cancel')
    await confirmMessageHarness.expectElementClass('cancelButton', 'confirm', false)
    await confirmMessageHarness.expectElementClass('cancelButton', 'mat-mdc-button', true)

    await confirmMessageHarness.expectElementText('confirmButton', 'Confirm')
    await confirmMessageHarness.expectElementClass('confirmButton', 'confirm', true)
    await confirmMessageHarness.expectElementClass('confirmButton', 'mat-mdc-raised-button', true)
  })

  it('confirm confirm/cancel test', async () => {
    const {
      harnesses
    } = await initTestComponent()
    const confirmMessage = 'Confirm message for confirm message box?'
    let confirmResult: boolean
    let confirmMessageHarness: MessageHarness

    service.confirm(confirmMessage, confirmed => confirmResult = confirmed)
    confirmMessageHarness = await harnesses.router.component.matDialogHarness('confirmMessageBox', MessageHarness)
    confirmResult = true

    await confirmMessageHarness.clickElement('cancelButton')
    await harnesses.router.component.expectMatDialogPresent('confirmMessageBox', false)
    expect(confirmResult).toBe(false)

    service.confirm(confirmMessage, confirmed => confirmResult = confirmed)
    confirmMessageHarness = await harnesses.router.component.matDialogHarness('confirmMessageBox', MessageHarness)
    confirmResult = false

    await confirmMessageHarness.clickElement('confirmButton')
    await harnesses.router.component.expectMatDialogPresent('confirmMessageBox', false)
    expect(confirmResult).toBe(true)
  })
})
