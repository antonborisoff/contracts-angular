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

    await expectAsync(errorMessageHarness.elementHasClass('messageToolbar', 'error')).toBeResolvedTo(true)
    await expectAsync(errorMessageHarness.elementText('messageIcon')).toBeResolvedTo('report_problem')
    await expectAsync(errorMessageHarness.elementText('messageTitle')).toBeResolvedTo('Error')
    await expectAsync(errorMessageHarness.elementText('message')).toBeResolvedTo(errorMessage)

    await expectAsync(errorMessageHarness.elementChildCount('messageActions')).toBeResolvedTo(1)

    await expectAsync(errorMessageHarness.elementText('closeButton')).toBeResolvedTo('Close')
    await expectAsync(errorMessageHarness.elementHasClass('closeButton', 'error')).toBeResolvedTo(true)
    await expectAsync(errorMessageHarness.elementHasClass('closeButton', 'mat-mdc-raised-button')).toBeResolvedTo(true)
  })

  it('error close test', async () => {
    const {
      harnesses
    } = await initTestComponent()
    const errorMessage = 'Error message for error message box'

    service.error(errorMessage)
    const messageBoxHarness = await harnesses.router.component.matDialogHarness('errorMessageBox', MessageHarness)

    await messageBoxHarness.clickElement('closeButton')
    await expectAsync(harnesses.router.component.matDialogPresent('errorMessageBox')).toBeResolvedTo(false)
  })

  it('confirm display test', async () => {
    const {
      harnesses
    } = await initTestComponent()
    const confirmMessage = 'Confirm message for confirm message box?'

    service.confirm(confirmMessage)
    const confirmMessageHarness = await harnesses.router.component.matDialogHarness('confirmMessageBox', MessageHarness)

    await expectAsync(confirmMessageHarness.elementHasClass('messageToolbar', 'confirm')).toBeResolvedTo(true)
    await expectAsync(confirmMessageHarness.elementText('messageIcon')).toBeResolvedTo('help_outline')
    await expectAsync(confirmMessageHarness.elementText('messageTitle')).toBeResolvedTo('Please, confirm')
    await expectAsync(confirmMessageHarness.elementText('message')).toBeResolvedTo(confirmMessage)

    await expectAsync(confirmMessageHarness.elementChildCount('messageActions')).toBeResolvedTo(2)

    await expectAsync(confirmMessageHarness.elementText('cancelButton')).toBeResolvedTo('Cancel')
    await expectAsync(confirmMessageHarness.elementHasClass('cancelButton', 'confirm')).toBeResolvedTo(false)
    await expectAsync(confirmMessageHarness.elementHasClass('cancelButton', 'mat-mdc-button')).toBeResolvedTo(true)

    await expectAsync(confirmMessageHarness.elementText('confirmButton')).toBeResolvedTo('Confirm')
    await expectAsync(confirmMessageHarness.elementHasClass('confirmButton', 'confirm')).toBeResolvedTo(true)
    await expectAsync(confirmMessageHarness.elementHasClass('confirmButton', 'mat-mdc-raised-button')).toBeResolvedTo(true)
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
    await expectAsync(harnesses.router.component.matDialogPresent('confirmMessageBox')).toBeResolvedTo(false)
    expect(confirmResult).toBe(false)

    service.confirm(confirmMessage, confirmed => confirmResult = confirmed)
    confirmMessageHarness = await harnesses.router.component.matDialogHarness('confirmMessageBox', MessageHarness)
    confirmResult = false

    await confirmMessageHarness.clickElement('confirmButton')
    await expectAsync(harnesses.router.component.matDialogPresent('confirmMessageBox')).toBeResolvedTo(false)
    expect(confirmResult).toBe(true)
  })
})
