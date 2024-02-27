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
    await expectAsync(baseHarness.buttonEnabled('enabled-button')).toBeResolvedTo(true)
    await expectAsync(baseHarness.buttonEnabled('disabled-button')).toBeResolvedTo(false)
    await expectAsync(baseHarness.buttonEnabled('non-existent-button')).toBeRejected()
  })

  it('elementVisible', async () => {
    await expectAsync(baseHarness.elementVisible('h1-element-visible')).toBeResolvedTo(true)
    await expectAsync(baseHarness.elementVisible('h1-element-invisible-if')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('h1-element-hidden')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('h1-element-style-display-none')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('h1-element-style-visibility-hidden')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('h1-element-class-display-none')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('h1-element-class-visibility-hidden')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('h1-element-non-existent')).toBeResolvedTo(false)

    await expectAsync(baseHarness.elementVisible('p-element-visible')).toBeResolvedTo(true)
    await expectAsync(baseHarness.elementVisible('p-element-invisible-if')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('p-element-hidden')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('p-element-style-display-none')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('p-element-style-visibility-hidden')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('p-element-class-display-none')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('p-element-class-visibility-hidden')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('p-element-non-existent')).toBeResolvedTo(false)

    await expectAsync(baseHarness.elementVisible('div-element-visible')).toBeResolvedTo(true)
    await expectAsync(baseHarness.elementVisible('div-element-invisible-if')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('div-element-hidden')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('div-element-style-display-none')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('div-element-style-visibility-hidden')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('div-element-class-display-none')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('div-element-class-visibility-hidden')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('div-element-non-existent')).toBeResolvedTo(false)

    await expectAsync(baseHarness.elementVisible('button-element-visible')).toBeResolvedTo(true)
    await expectAsync(baseHarness.elementVisible('button-element-invisible-if')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('button-element-hidden')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('button-element-style-display-none')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('button-element-style-visibility-hidden')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('button-element-class-display-none')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('button-element-class-visibility-hidden')).toBeResolvedTo(false)
    await expectAsync(baseHarness.elementVisible('button-element-non-existent')).toBeResolvedTo(false)
  })

  it('elementText', async () => {
    await expectAsync(baseHarness.elementText('h1-element-text')).toBeResolvedTo('h1 text')
    await expectAsync(baseHarness.elementText('p-element-text')).toBeResolvedTo('p text')
    await expectAsync(baseHarness.elementText('div-element-text')).toBeResolvedTo('div text')

    await expectAsync(baseHarness.elementText('h1-element-text-non-existent')).toBeRejected()
    await expectAsync(baseHarness.elementText('p-element-text-non-existent')).toBeRejected()
    await expectAsync(baseHarness.elementText('div-element-text-non-existent')).toBeRejected()
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
