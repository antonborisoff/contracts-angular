import {
  TestBed
} from '@angular/core/testing'

import {
  TestComponent
} from './test.component'
import {
  TestbedHarnessEnvironment
} from '@angular/cdk/testing/testbed'
import {
  TestComponentHarness
} from './test.component.harness'
import {
  Utilities
} from '../utilities'

describe('Base harness', () => {
  let baseHarness: TestComponentHarness
  let testComponent: TestComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents()

    const fixture = TestBed.createComponent(TestComponent)
    baseHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TestComponentHarness)
    testComponent = fixture.componentInstance
  })

  it('clickButton', async () => {
    await baseHarness.clickButton('enabled-button')
    expect(testComponent.getElementClicked('enabled-button')).toBe('Enabled Button')

    await expectAsync(baseHarness.clickButton('disabled-button')).toBeRejected()
    expect(testComponent.getElementClicked('disabled-button')).toBeUndefined()

    await expectAsync(baseHarness.clickButton('non-existent-button')).toBeRejected()
    expect(testComponent.getElementClicked('non-existent-button')).toBeUndefined()

    // elements in wrapper found, not global ones
    await baseHarness.inElement('button-element-wrapper').clickButton('enabled-button')
    expect(testComponent.getElementClicked('enabled-button')).toBe('Enabled Button in Wrapper')

    // elements in wrapper are looked up and not found, global elements are ignored
    await expectAsync(baseHarness.inElement('button-element-wrapper-non-existent').clickButton('enabled-button')).toBeRejected()
  })

  it('clickLink', async () => {
    await baseHarness.clickLink('link')
    expect(testComponent.getElementClicked('link')).toBe('Link')

    await expectAsync(baseHarness.clickLink('non-existent-link')).toBeRejected()
  })

  it('buttonEnabled', async () => {
    await expectAsync(baseHarness.elementPresent('enabled-button', 'button')).toBeResolvedTo(true)
    await expectAsync(baseHarness.buttonEnabled('enabled-button')).toBeResolvedTo(true)

    await expectAsync(baseHarness.elementPresent('disabled-button', 'button')).toBeResolvedTo(true)
    await expectAsync(baseHarness.buttonEnabled('disabled-button')).toBeResolvedTo(false)

    await expectAsync(baseHarness.elementPresent('non-existent-button', 'button')).toBeResolvedTo(false)
    await expectAsync(baseHarness.buttonEnabled('non-existent-button')).toBeRejected()
  })

  it('inputValue', async () => {
    await expectAsync(baseHarness.elementPresent('input-value', 'input')).toBeResolvedTo(true)
    await expectAsync(baseHarness.inputValue('input-value')).toBeResolvedTo('some input value')

    await expectAsync(baseHarness.elementPresent('non-existent-input-value', 'input')).toBeResolvedTo(false)
    await expectAsync(baseHarness.buttonEnabled('non-existent-input-value')).toBeRejected()
  })

  it('elementVisible', async () => {
    const tags = [
      'h1',
      'p',
      'div',
      'button',
      'a'
    ]
    for (const tag of tags) {
      await expectAsync(baseHarness.elementPresent(`${tag}-element-visible`, tag)).toBeResolvedTo(true)
      await expectAsync(baseHarness.elementVisible(`${tag}-element-visible`)).toBeResolvedTo(true)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-invisible-if`, tag)).toBeResolvedTo(false)
      await expectAsync(baseHarness.elementVisible(`${tag}-element-invisible-if`)).toBeResolvedTo(false)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-hidden`, tag)).toBeResolvedTo(true)
      await expectAsync(baseHarness.elementVisible(`${tag}-element-hidden`)).toBeResolvedTo(false)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-style-display-none`, tag)).toBeResolvedTo(true)
      await expectAsync(baseHarness.elementVisible(`${tag}-element-style-display-none`)).toBeResolvedTo(false)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-style-visibility-hidden`, tag)).toBeResolvedTo(true)
      await expectAsync(baseHarness.elementVisible(`${tag}-element-style-visibility-hidden`)).toBeResolvedTo(false)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-class-display-none`, tag)).toBeResolvedTo(true)
      await expectAsync(baseHarness.elementVisible(`${tag}-element-class-display-none`)).toBeResolvedTo(false)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-class-visibility-hidden`, tag)).toBeResolvedTo(true)
      await expectAsync(baseHarness.elementVisible(`${tag}-element-class-visibility-hidden`)).toBeResolvedTo(false)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-non-existent`, tag)).toBeResolvedTo(false)
      await expectAsync(baseHarness.elementVisible(`${tag}-element-non-existent`)).toBeResolvedTo(false)
    }
  })

  it('elementText', async () => {
    const tags = [
      'h1',
      'h4',
      'p',
      'div'
    ]
    for (const tag of tags) {
      const elementId = `${tag}-element-text`
      await expectAsync(baseHarness.elementPresent(elementId, tag)).toBeResolvedTo(true)
      await expectAsync(baseHarness.elementText(elementId)).toBeResolvedTo(`${tag} text`)

      await expectAsync(baseHarness.elementPresent(`${elementId}-non-existent`, tag)).toBeResolvedTo(false)
      await expectAsync(baseHarness.elementText(`${elementId}-non-existent`)).toBeRejected()

      // elements in wrapper found, not global ones
      await expectAsync(baseHarness.inElement('text-element-wrapper').elementPresent(elementId, tag)).toBeResolvedTo(true)
      await expectAsync(baseHarness.inElement('text-element-wrapper').elementText(elementId)).toBeResolvedTo(`${tag} text in wrapper`)

      // elements in wrapper are looked up and not found, global elements are ignored
      await expectAsync(baseHarness.inElement('text-element-wrapper-non-existent-elements').elementPresent(elementId, tag)).toBeResolvedTo(false)
      await expectAsync(baseHarness.inElement('text-element-wrapper-non-existent-elements').elementText(elementId)).toBeRejected()
    }
  })

  it('elementChildCount', async () => {
    await expectAsync(baseHarness.elementChildCount('div-child-count-no-grandchild-present')).toBeResolvedTo(2)
    await expectAsync(baseHarness.elementChildCount('div-child-count-grandchild-present')).toBeResolvedTo(2)

    await expectAsync(baseHarness.elementChildCount('div-child-count-no-grandchild-present-non-existent')).toBeRejected()
    await expectAsync(baseHarness.elementChildCount('div-child-count-grandchild-present-non-existent')).toBeRejected()
  })

  it('enterValue - updateOn: change', async () => {
    let formValuesOnChange: string[] = []
    testComponent.formControlUpdateOnChange.valueChanges.subscribe((value: string) => {
      formValuesOnChange.push(value)
    })

    formValuesOnChange = []
    await baseHarness.enterValue('input-element-update-on-change', 'some value')
    expect(formValuesOnChange.pop()).toBe('some value')

    formValuesOnChange = []
    await baseHarness.enterValue('input-element-update-on-change', '')
    expect(formValuesOnChange.pop()).toBe('')

    formValuesOnChange = []
    await expectAsync(baseHarness.enterValue('input-element-update-on-change-non-existent', '')).toBeRejected()
    expect(formValuesOnChange.pop()).toBeUndefined()
  })

  it('enterValue - updateOn: blur', async () => {
    let formValuesOnBlur: string[] = []
    testComponent.formControlUpdateOnBlur.valueChanges.subscribe((value: string) => {
      formValuesOnBlur.push(value)
    })

    formValuesOnBlur = []
    await baseHarness.enterValue('input-element-update-on-blur', 'some value', false)
    expect(formValuesOnBlur.pop()).toBeUndefined()

    formValuesOnBlur = []
    await baseHarness.enterValue('input-element-update-on-blur', 'some value')
    expect(formValuesOnBlur.pop()).toBe('some value')

    formValuesOnBlur = []
    await baseHarness.enterValue('input-element-update-on-blur', '', false)
    expect(formValuesOnBlur.pop()).toBeUndefined()

    formValuesOnBlur = []
    await baseHarness.enterValue('input-element-update-on-blur', '')
    expect(formValuesOnBlur.pop()).toBe('')

    formValuesOnBlur = []
    await expectAsync(baseHarness.enterValue('input-element-update-on-blur-non-existent', '')).toBeRejected()
    expect(formValuesOnBlur.pop()).toBeUndefined()
  })

  it('Utilities - actOnMessageBox', async () => {
    expect(await baseHarness.elementText('message-box-confirmation-status')).toBe('Rejected')

    await Utilities.actOnMessageBox(async () => {
      await baseHarness.clickButton('button-triggers-message-box-confirmation')
    }, 'confirm')
    expect(await baseHarness.elementText('message-box-confirmation-status')).toBe('Confirmed')

    await Utilities.actOnMessageBox(async () => {
      await baseHarness.clickButton('button-triggers-message-box-confirmation')
    }, 'cancel')
    expect(await baseHarness.elementText('message-box-confirmation-status')).toBe('Rejected')
  })

  it('Utilities - errorMessageBoxPresent', async () => {
    expect(await Utilities.errorMessageBoxPresent(async () => {
      await baseHarness.clickButton('button-triggers-message-box-error')
    })).toBe(true)

    expect(await Utilities.errorMessageBoxPresent(async () => {
      await baseHarness.clickButton('button-triggers-no-message-box-error')
    })).toBe(false)
  })
})
