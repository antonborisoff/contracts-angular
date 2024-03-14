import {
  TestBed
} from '@angular/core/testing'

import {
  MessageBoxService
} from './message-box.service'
import {
  HarnessLoader
} from '@angular/cdk/testing'
import {
  TestbedHarnessEnvironment
} from '@angular/cdk/testing/testbed'
import {
  TestComponent
} from '../../tests/utils'
import {
  MatDialogHarness
} from '@angular/material/dialog/testing'
import {
  MessageComponent
} from './component/message/message.component'
import en from './component/message/i18n/en.json'
import {
  getTranslocoTestingModule
} from '../../../transloco/transloco-testing'
import {
  MatToolbarHarness
} from '@angular/material/toolbar/testing'
import {
  MatIconHarness
} from '@angular/material/icon/testing'
import {
  MatButtonHarness
} from '@angular/material/button/testing'

describe('MessageBoxService', () => {
  let service: MessageBoxService
  let rootLoader: HarnessLoader

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TestComponent,
        getTranslocoTestingModule(MessageComponent, en)
      ]
    })
    service = TestBed.inject(MessageBoxService)
    const fixture = TestBed.createComponent(TestComponent)
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture)
  })

  it('error displays errors properly', () => {
    const alertSpy = spyOn<typeof window, 'alert'>(window, 'alert')
    const consoleSpy = spyOn<typeof console, 'error'>(console, 'error')
    const errorMessage = 'some error'

    service.error(errorMessage)
    expect(alertSpy).toHaveBeenCalledWith(errorMessage)
    expect(consoleSpy).toHaveBeenCalledWith(errorMessage)
  })

  it('error2 display test', async () => {
    const errorMessage = 'Error message for error message box'

    service.error2(errorMessage)
    const errorMessageHarness = await rootLoader.getHarness(MatDialogHarness)

    expect(await errorMessageHarness.getId()).toBe('errorMessageBox')

    const titleHarness = await errorMessageHarness.getHarness(MatToolbarHarness)
    const title = await titleHarness.host()
    expect(await title.hasClass('error')).toBe(true)

    const titleIconHarness = await titleHarness.getHarness(MatIconHarness)
    const titleIconName = await titleIconHarness.getName()
    expect(titleIconName).toBe('report_problem')

    expect(await errorMessageHarness.getTitleText()).toBe(`${titleIconName} Error`)

    expect(await errorMessageHarness.getContentText()).toBe(errorMessage)

    const errorButtonHarnesses = await errorMessageHarness.getAllHarnesses(MatButtonHarness)
    expect(errorButtonHarnesses).toHaveSize(1)

    const closeButtonHarness = errorButtonHarnesses[0]
    expect(await closeButtonHarness.getText()).toBe('Close')
    expect(await closeButtonHarness.getVariant()).toBe('raised')
    const closeButton = await closeButtonHarness.host()
    expect(await closeButton.hasClass('error')).toBe(true)
    expect(await closeButton.getAttribute('data-id')).toBe('closeButton')
  })

  it('error2 close test', async () => {
    const errorMessage = 'Error message for error message box'

    service.error2(errorMessage)
    const errorMessageHarness = await rootLoader.getHarness(MatDialogHarness)
    const closeButtonHarness = (await errorMessageHarness.getAllHarnesses(MatButtonHarness))[0]

    await closeButtonHarness.click()
    expect(await rootLoader.getHarnessOrNull(MatDialogHarness)).toBeNull()
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

  it('confirm2 display test', async () => {
    const confirmMessage = 'Confirm message for confirm message box?'

    service.confirm2(confirmMessage)
    const confirmMessageHarness = await rootLoader.getHarness(MatDialogHarness)

    expect(await confirmMessageHarness.getId()).toBe('confirmMessageBox')

    const titleHarness = await confirmMessageHarness.getHarness(MatToolbarHarness)
    const title = await titleHarness.host()
    expect(await title.hasClass('confirm')).toBe(true)

    const titleIconHarness = await titleHarness.getHarness(MatIconHarness)
    const titleIconName = await titleIconHarness.getName()
    expect(titleIconName).toBe('help_outline')

    expect(await confirmMessageHarness.getTitleText()).toBe(`${titleIconName} Please, confirm`)

    expect(await confirmMessageHarness.getContentText()).toBe(confirmMessage)

    const confirmButtonHarnesses = await confirmMessageHarness.getAllHarnesses(MatButtonHarness)
    expect(confirmButtonHarnesses).toHaveSize(2)

    const cancelButtonHarness = confirmButtonHarnesses[0]
    expect(await cancelButtonHarness.getText()).toBe('Cancel')
    expect(await cancelButtonHarness.getVariant()).toBe('basic')
    const cancelButton = await cancelButtonHarness.host()
    expect(await cancelButton.hasClass('confirm')).toBe(false)
    expect(await cancelButton.getAttribute('data-id')).toBe('cancelButton')

    const confirmButtonHarness = confirmButtonHarnesses[1]
    expect(await confirmButtonHarness.getText()).toBe('Confirm')
    expect(await confirmButtonHarness.getVariant()).toBe('raised')
    const confirmButton = await confirmButtonHarness.host()
    expect(await confirmButton.hasClass('confirm')).toBe(true)
    expect(await confirmButton.getAttribute('data-id')).toBe('confirmButton')
  })

  it('confirm2 confirm/cancel test', async () => {
    const confirmMessage = 'Confirm message for confirm message box?'
    let confirmResult: boolean
    let confirmMessageHarness: MatDialogHarness

    service.confirm2(confirmMessage, confirmed => confirmResult = confirmed)
    confirmMessageHarness = await rootLoader.getHarness(MatDialogHarness)
    const cancelButtonHarness = (await confirmMessageHarness.getAllHarnesses(MatButtonHarness))[0]
    confirmResult = true

    await cancelButtonHarness.click()
    expect(await rootLoader.getHarnessOrNull(MatDialogHarness)).toBeNull()
    expect(confirmResult).toBe(false)

    service.confirm2(confirmMessage, confirmed => confirmResult = confirmed)
    confirmMessageHarness = await rootLoader.getHarness(MatDialogHarness)
    const confirmButton = (await confirmMessageHarness.getAllHarnesses(MatButtonHarness))[1]
    confirmResult = false

    await confirmButton.click()
    expect(await rootLoader.getHarnessOrNull(MatDialogHarness)).toBeNull()
    expect(confirmResult).toBe(true)
  })
})
