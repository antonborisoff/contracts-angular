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
    expect(testComponent.isElementClicked('enabled-button')).toBe(true)

    await expectAsync(baseHarness.clickButton('disabled-button')).toBeRejected()
    expect(testComponent.isElementClicked('disabled-button')).toBe(false)

    await expectAsync(baseHarness.clickButton('non-existent-button')).toBeRejected()
  })

  it('clickLink', async () => {
    await baseHarness.clickLink('link')
    expect(testComponent.isElementClicked('link')).toBe(true)

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

  it('elementVisible', async () => {
    const tags = [
      'h1',
      'p',
      'div',
      'button'
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
      await expectAsync(baseHarness.elementPresent(`${tag}-element-text`, tag)).toBeResolvedTo(true)
      await expectAsync(baseHarness.elementText(`${tag}-element-text`)).toBeResolvedTo(`${tag} text`)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-text-non-existent`, tag)).toBeResolvedTo(false)
      await expectAsync(baseHarness.elementText(`${tag}-element-text-non-existent`)).toBeRejected()
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
})
