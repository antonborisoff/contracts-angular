import {
  ComponentFixture,
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
  MessageBoxUtils
} from '../utilities'
import {
  MessageActions,
  MessageType
} from '../../../services/message-box/interfaces'
import {
  getTranslocoTestingModule
} from '../../../../transloco/transloco-testing'

describe('Base harness', () => {
  let baseHarness: TestComponentHarness
  let fixture: ComponentFixture<TestComponent>
  let testComponent: TestComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestComponent,
        getTranslocoTestingModule(TestComponent, {})
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(TestComponent)
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
    const tags = [
      'input',
      'textarea'
    ]
    for (const tag of tags) {
      await expectAsync(baseHarness.elementPresent(`${tag}-value`, tag)).toBeResolvedTo(true)
      await expectAsync(baseHarness.inputValue(`${tag}-value`)).toBeResolvedTo(`some ${tag} value`)

      await expectAsync(baseHarness.elementPresent(`non-existent-${tag}-value`, tag)).toBeResolvedTo(false)
      await expectAsync(baseHarness.buttonEnabled(`non-existent-${tag}-value`)).toBeRejected()
    }
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
    const tags = [
      {
        tag: 'input',
        formControl: testComponent.formControlInputUpdateOnChange
      },
      {
        tag: 'textarea',
        formControl: testComponent.formControlTextareaUpdateOnChange
      }
    ]
    for (const tag of tags) {
      let formValuesOnChange: string[] = []
      tag.formControl.valueChanges.subscribe((value: string) => {
        formValuesOnChange.push(value)
      })

      formValuesOnChange = []
      await baseHarness.enterValue(`${tag.tag}-element-update-on-change`, `some ${tag.tag} value`)
      expect(formValuesOnChange.pop()).toBe(`some ${tag.tag} value`)

      formValuesOnChange = []
      await baseHarness.enterValue(`${tag.tag}-element-update-on-change`, '')
      expect(formValuesOnChange.pop()).toBe('')

      formValuesOnChange = []
      await expectAsync(baseHarness.enterValue(`${tag.tag}-element-update-on-change-non-existent`, '')).toBeRejected()
      expect(formValuesOnChange.pop()).toBeUndefined()
    }
  })

  it('enterValue - updateOn: blur', async () => {
    const tags = [
      {
        tag: 'input',
        formControl: testComponent.formControlInputUpdateOnBlur
      },
      {
        tag: 'textarea',
        formControl: testComponent.formControlTextareaUpdateOnBlur
      }
    ]
    for (const tag of tags) {
      let formValuesOnBlur: string[] = []
      tag.formControl.valueChanges.subscribe((value: string) => {
        formValuesOnBlur.push(value)
      })

      formValuesOnBlur = []
      await baseHarness.enterValue(`${tag.tag}-element-update-on-blur`, `some ${tag.tag} value`, false)
      expect(formValuesOnBlur.pop()).toBeUndefined()

      formValuesOnBlur = []
      await baseHarness.enterValue(`${tag.tag}-element-update-on-blur`, `some ${tag.tag} value`)
      expect(formValuesOnBlur.pop()).toBe(`some ${tag.tag} value`)

      formValuesOnBlur = []
      await baseHarness.enterValue(`${tag.tag}-element-update-on-blur`, '', false)
      expect(formValuesOnBlur.pop()).toBeUndefined()

      formValuesOnBlur = []
      await baseHarness.enterValue(`${tag.tag}-element-update-on-blur`, '')
      expect(formValuesOnBlur.pop()).toBe('')

      formValuesOnBlur = []
      await expectAsync(baseHarness.enterValue(`${tag.tag}-element-update-on-blur-non-existent`, '')).toBeRejected()
      expect(formValuesOnBlur.pop()).toBeUndefined()
    }
  })

  it('MessageBoxUtils - present', async () => {
    const messageBoxHarness = new MessageBoxUtils(fixture)

    await expectAsync(messageBoxHarness.present(MessageType.ERROR)).toBeResolvedTo(false)
    await expectAsync(messageBoxHarness.present(MessageType.CONFIRM)).toBeResolvedTo(false)

    await baseHarness.clickButton('button-triggers-message-box-error')
    await expectAsync(messageBoxHarness.present(MessageType.ERROR)).toBeResolvedTo(true)
    await expectAsync(messageBoxHarness.present(MessageType.ERROR, 'message box error')).toBeResolvedTo(true)
    await expectAsync(messageBoxHarness.present(MessageType.ERROR, 'some random message')).toBeResolvedTo(false)
    await expectAsync(messageBoxHarness.present(MessageType.CONFIRM)).toBeResolvedTo(false)
  })

  it('MessageBoxUtils - act', async () => {
    const messageBoxHarness = new MessageBoxUtils(fixture)

    await expectAsync(messageBoxHarness.present(MessageType.ERROR)).toBeResolvedTo(false)

    await baseHarness.clickButton('button-triggers-message-box-error')
    await expectAsync(messageBoxHarness.present(MessageType.ERROR)).toBeResolvedTo(true)

    await messageBoxHarness.act(MessageActions.CLOSE)
    await expectAsync(messageBoxHarness.present(MessageType.ERROR)).toBeResolvedTo(false)
  })

  it('MessageBoxUtils - act - no message box', async () => {
    const messageBoxHarness = new MessageBoxUtils(fixture)

    await expectAsync(messageBoxHarness.present(MessageType.ERROR)).toBeResolvedTo(false)

    await expectAsync(messageBoxHarness.act(MessageActions.CLOSE)).toBeRejectedWithError()
  })

  it('MessageBoxUtils - act - no message action', async () => {
    const messageBoxHarness = new MessageBoxUtils(fixture)

    await baseHarness.clickButton('button-triggers-message-box-error')

    await expectAsync(messageBoxHarness.act(MessageActions.CONFIRM)).toBeRejectedWithError()
  })
})
