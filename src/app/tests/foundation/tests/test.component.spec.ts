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
  TestComponentHarness,
  WaitingTestComponentHarness
} from './test.component.harness'
import {
  MessageActions,
  MessageType
} from '../../../services/message-box/interfaces'
import {
  getTranslocoTestingModule
} from '../../../../transloco/transloco-testing'
import {
  BusyStateService
} from '../../../services/busy/busy-state.service'
import {
  defer,
  delay,
  of
} from 'rxjs'
import {
  NoopAnimationsModule
} from '@angular/platform-browser/animations'

describe('Base harnesses', () => {
  let baseHarness: TestComponentHarness
  let waitingBaseHarness: WaitingTestComponentHarness
  let testComponent: TestComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestComponent,
        getTranslocoTestingModule(TestComponent, {}),
        NoopAnimationsModule
      ]
    }).compileComponents()

    const fixture = TestBed.createComponent(TestComponent)
    baseHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TestComponentHarness)
    waitingBaseHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, WaitingTestComponentHarness)
    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture)
    baseHarness.initRootLoader(rootLoader)
    testComponent = fixture.componentInstance
  })

  it('clickElement', async () => {
    const tags: {
      name: string
      disabable: boolean
    }[] = [
      {
        name: 'button',
        disabable: true
      },
      {
        name: 'a',
        disabable: false
      },
      {
        name: 'div',
        disabable: false
      },
      {
        name: 'mat-card',
        disabable: false
      }
    ]
    for (const tag of tags) {
      await baseHarness.clickElement(`enabled-${tag.name}`)
      expect(testComponent.getElementClicked(`enabled-${tag.name}`)).toBe(`Enabled ${tag.name}`)

      if (tag.disabable) {
        await expectAsync(baseHarness.clickElement(`disabled-${tag.name}`)).toBeRejected()
        expect(testComponent.getElementClicked(`disabled-${tag.name}`)).toBeUndefined()
      }
      else {
        await baseHarness.clickElement(`disabled-${tag.name}`)
        expect(testComponent.getElementClicked(`disabled-${tag.name}`)).toBe(`Disabled ${tag.name}`)
      }

      await expectAsync(baseHarness.clickElement(`non-existent-${tag}`)).toBeRejected()
      expect(testComponent.getElementClicked(`non-existent-${tag}`)).toBeUndefined()

      // elements in wrapper found, not global ones
      await baseHarness.inElement('element-wrapper').clickElement(`enabled-${tag.name}`)
      expect(testComponent.getElementClicked(`enabled-${tag.name}`)).toBe(`Enabled ${tag.name} in Wrapper`)

      // elements in wrapper are looked up and not found, global elements are ignored
      await expectAsync(baseHarness.inElement('element-wrapper-non-existent').clickElement(`enabled-${tag.name}`)).toBeRejected()
    }
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

  it('selectMatMenuItem', async () => {
    await baseHarness.expectElementText('selectedMatMenuOption', '')

    await expectAsync(baseHarness.selectMatMenuItem('Non-existent Option')).toBeRejected()
    await baseHarness.expectElementText('selectedMatMenuOption', '')

    await expectAsync(baseHarness.selectMatMenuItem('Option A')).toBeRejected()
    await baseHarness.expectElementText('selectedMatMenuOption', '')

    await baseHarness.clickElement('matMenuTrigger')

    await expectAsync(baseHarness.selectMatMenuItem('Non-existent Option')).toBeRejected()
    await baseHarness.expectElementText('selectedMatMenuOption', '')

    await baseHarness.selectMatMenuItem('Option A')
    await baseHarness.expectElementText('selectedMatMenuOption', 'option_A')
  })

  it('messageBoxClick', async () => {
    await expectAsync(baseHarness.expectMessageBoxPresent(MessageType.ERROR)).toBeRejected()

    await baseHarness.clickElement('button-triggers-message-box-error')
    await baseHarness.expectMessageBoxPresent(MessageType.ERROR)

    await baseHarness.messageBoxClick(MessageActions.CLOSE)
    await expectAsync(baseHarness.expectMessageBoxPresent(MessageType.ERROR)).toBeRejected()
  })

  it('messageBoxClick - no message box', async () => {
    await expectAsync(baseHarness.expectMessageBoxPresent(MessageType.ERROR)).toBeRejected()

    await expectAsync(baseHarness.messageBoxClick(MessageActions.CLOSE)).toBeRejected()
  })

  it('messageBoxClick - no message action', async () => {
    await baseHarness.clickElement('button-triggers-message-box-error')

    await expectAsync(baseHarness.messageBoxClick(MessageActions.CONFIRM)).toBeRejectedWithError()
  })

  it('expectButtonEnabled', async () => {
    await expectAsync(baseHarness.elementPresent('enabled-button', 'button')).toBeResolvedTo(true)
    await baseHarness.expectButtonEnabled('enabled-button', true)

    await expectAsync(baseHarness.elementPresent('disabled-button', 'button')).toBeResolvedTo(true)
    await baseHarness.expectButtonEnabled('disabled-button', false)

    await expectAsync(baseHarness.elementPresent('non-existent-button', 'button')).toBeResolvedTo(false)
    await expectAsync(baseHarness.expectButtonEnabled('non-existent-button', true)).toBeRejected()
  })

  it('expctInputValue', async () => {
    const tags = [
      'input',
      'textarea'
    ]
    for (const tag of tags) {
      await expectAsync(baseHarness.elementPresent(`${tag}-value`, tag)).toBeResolvedTo(true)
      await baseHarness.expectInputValue(`${tag}-value`, `some ${tag} value`)

      await expectAsync(baseHarness.elementPresent(`non-existent-${tag}-value`, tag)).toBeResolvedTo(false)
      await expectAsync(baseHarness.expectInputValue(`non-existent-${tag}-value`, `some ${tag} value`)).toBeRejected()
    }
  })

  it('expectElementVisible', async () => {
    const tags = [
      'h1',
      'p',
      'div',
      'button',
      'a',
      'td',
      'mat-error',
      'mat-card'
    ]
    const tagsNotSupportingHidden = ['mat-card']
    for (const tag of tags) {
      await expectAsync(baseHarness.elementPresent(`${tag}-element-visible`, tag)).toBeResolvedTo(true)
      await baseHarness.expectElementVisible(`${tag}-element-visible`, true)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-invisible-if`, tag)).toBeResolvedTo(false)
      await baseHarness.expectElementVisible(`${tag}-element-invisible-if`, false)

      if (!tagsNotSupportingHidden.includes(tag)) {
        await expectAsync(baseHarness.elementPresent(`${tag}-element-hidden`, tag)).toBeResolvedTo(true)
        await baseHarness.expectElementVisible(`${tag}-element-hidden`, false)
      }
      else {
        await expectAsync(baseHarness.elementPresent(`${tag}-element-hidden`, tag)).toBeResolvedTo(true)
        await baseHarness.expectElementVisible(`${tag}-element-hidden`, true)
      }

      await expectAsync(baseHarness.elementPresent(`${tag}-element-style-display-none`, tag)).toBeResolvedTo(true)
      await baseHarness.expectElementVisible(`${tag}-element-style-display-none`, false)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-style-visibility-hidden`, tag)).toBeResolvedTo(true)
      await baseHarness.expectElementVisible(`${tag}-element-style-visibility-hidden`, false)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-class-display-none`, tag)).toBeResolvedTo(true)
      await baseHarness.expectElementVisible(`${tag}-element-class-display-none`, false)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-class-visibility-hidden`, tag)).toBeResolvedTo(true)
      await baseHarness.expectElementVisible(`${tag}-element-class-visibility-hidden`, false)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-non-existent`, tag)).toBeResolvedTo(false)
      await baseHarness.expectElementVisible(`${tag}-element-non-existent`, false)
    }
  })

  it('expectElementText', async () => {
    const tags = [
      'h1',
      'h4',
      'p',
      'div',
      'span',
      'button',
      'td',
      'mat-icon'
    ]
    for (const tag of tags) {
      const elementId = `${tag}-element-text`
      await expectAsync(baseHarness.elementPresent(elementId, tag)).toBeResolvedTo(true)
      await baseHarness.expectElementText(elementId, `${tag} text`)

      await expectAsync(baseHarness.expectElementText(elementId, `${tag} text other`)).toBeRejected()

      await expectAsync(baseHarness.elementPresent(`${elementId}-non-existent`, tag)).toBeResolvedTo(false)
      await expectAsync(baseHarness.expectElementText(`${elementId}-non-existent`, `${tag} text`)).toBeRejected()

      // elements in wrapper found, not global ones
      await expectAsync(baseHarness.inElement('text-element-wrapper').elementPresent(elementId, tag)).toBeResolvedTo(true)
      await baseHarness.inElement('text-element-wrapper').expectElementText(elementId, `${tag} text in wrapper`)

      // elements in wrapper are looked up and not found, global elements are ignored
      await expectAsync(baseHarness.inElement('text-element-wrapper-non-existent-elements').elementPresent(elementId, tag)).toBeResolvedTo(false)
      await expectAsync(baseHarness.inElement('text-element-wrapper-non-existent-elements').expectElementText(elementId, `${tag} text in wrapper`)).toBeRejected()
    }
  })

  it('expectElementClass', async () => {
    const tags = [
      'button',
      'mat-toolbar'
    ]
    for (const tag of tags) {
      await expectAsync(baseHarness.elementPresent(`${tag}-element-class`, tag)).toBeResolvedTo(true)
      await baseHarness.expectElementClass(`${tag}-element-class`, `testClass-${tag}`, true)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-class`, tag)).toBeResolvedTo(true)
      await baseHarness.expectElementClass(`${tag}-element-class`, `testClass-${tag}-other`, false)

      await expectAsync(baseHarness.elementPresent(`${tag}-element-class-non-existent`, tag)).toBeResolvedTo(false)
      await expectAsync(baseHarness.expectElementClass(`${tag}-element-class-non-existent`, `testClass-${tag}`, true)).toBeRejected()
    }
  })

  it('elementChildCount', async () => {
    await expectAsync(baseHarness.elementChildCount('div-child-count-no-grandchild-present')).toBeResolvedTo(2)
    await expectAsync(baseHarness.elementChildCount('div-child-count-grandchild-present')).toBeResolvedTo(2)

    await expectAsync(baseHarness.elementChildCount('div-child-count-no-grandchild-present-non-existent')).toBeRejected()
    await expectAsync(baseHarness.elementChildCount('div-child-count-grandchild-present-non-existent')).toBeRejected()
  })

  it('expectMessageBoxPresent', async () => {
    await expectAsync(baseHarness.expectMessageBoxPresent(MessageType.ERROR)).toBeRejected()
    await expectAsync(baseHarness.expectMessageBoxPresent(MessageType.CONFIRM)).toBeRejected()

    await baseHarness.clickElement('button-triggers-message-box-error')
    await baseHarness.expectMessageBoxPresent(MessageType.ERROR)
    await baseHarness.expectMessageBoxPresent(MessageType.ERROR, 'message box error')
    await expectAsync(baseHarness.expectMessageBoxPresent(MessageType.ERROR, 'some random message')).toBeRejected()
    await expectAsync(baseHarness.expectMessageBoxPresent(MessageType.CONFIRM)).toBeRejected()
  })

  it('expectMatDialogPresent', async () => {
    await expectAsync(baseHarness.expectMatDialogPresent('testMatDialog', true)).toBeRejected()
    await expectAsync(baseHarness.expectMatDialogPresent('testMatDialogNonExistent', true)).toBeRejected()
    await baseHarness.expectMatDialogPresent('testMatDialog', false)
    await baseHarness.expectMatDialogPresent('testMatDialogNonExistent', false)

    await baseHarness.clickElement('button-triggers-mat-dialog')

    await baseHarness.expectMatDialogPresent('testMatDialog', true)
    await expectAsync(baseHarness.expectMatDialogPresent('testMatDialogNonExistent', true)).toBeRejected()
    await expectAsync(baseHarness.expectMatDialogPresent('testMatDialog', false)).toBeRejected()
    await baseHarness.expectMatDialogPresent('testMatDialogNonExistent', false)
  })

  const EMITTER_DELAY = 1000
  it('waiting harness - expectElementFree', async () => {
    const busyStateService = TestBed.inject(BusyStateService)
    const stream = defer(() => {
      return of(1).pipe(delay(EMITTER_DELAY))
    })
    const elementId = 'div-busy-unless-waiting-element'

    await expectAsync(baseHarness.elementPresent(elementId, 'div')).toBeResolvedTo(true)

    stream.pipe(busyStateService.processLoading('div-busy')).subscribe()
    await expectAsync(baseHarness.elementBusy(elementId)).toBeResolvedTo(true)

    await waitingBaseHarness.expectElementFree(elementId)
    await expectAsync(baseHarness.elementBusy(elementId)).toBeResolvedTo(false)
  })

  it('waiting harness - expectElementFree - waiting timed out', async () => {
    const busyStateService = TestBed.inject(BusyStateService)
    const stream = defer(() => {
      return of(1).pipe(delay(EMITTER_DELAY * 2))
    })
    const elementId = 'div-busy-unless-waiting-element'

    await expectAsync(baseHarness.elementPresent(elementId, 'div')).toBeResolvedTo(true)

    const subscription = stream.pipe(busyStateService.processLoading('div-busy')).subscribe()
    await expectAsync(baseHarness.elementBusy(elementId)).toBeResolvedTo(true)

    // wait less than the delay in the stream
    await expectAsync(waitingBaseHarness.withTimeout(EMITTER_DELAY).expectElementFree(elementId)).toBeRejected()
    subscription.unsubscribe()
  })

  it('waiting harness - expectElementVisible', async () => {
    const stream = defer(() => {
      return of(true).pipe(delay(EMITTER_DELAY))
    })
    const elementNotVisibleUnlessWaitingId = 'div-not-visible-unless-waiting-element'

    await expectAsync(baseHarness.elementPresent(elementNotVisibleUnlessWaitingId, 'div')).toBeResolvedTo(false)

    stream.subscribe(() => {
      testComponent.isPresent.next(true)
    })
    await expectAsync(baseHarness.elementPresent(elementNotVisibleUnlessWaitingId, 'div')).toBeResolvedTo(false)

    await waitingBaseHarness.expectElementVisible(elementNotVisibleUnlessWaitingId, true)
    await expectAsync(baseHarness.elementPresent(elementNotVisibleUnlessWaitingId, 'div')).toBeResolvedTo(true)
  })

  it('waiting harness - expectElementVisible - waiting timed out', async () => {
    const stream = defer(() => {
      return of(true).pipe(delay(EMITTER_DELAY * 2))
    })
    const elementNotVisibleUnlessWaitingId = 'div-not-visible-unless-waiting'

    await expectAsync(baseHarness.elementPresent(elementNotVisibleUnlessWaitingId, 'div')).toBeResolvedTo(false)

    const subscription = stream.subscribe(() => {
      testComponent.isPresent.next(true)
    })
    await expectAsync(baseHarness.elementPresent(elementNotVisibleUnlessWaitingId, 'div')).toBeResolvedTo(false)

    // wait less than the delay in the stream
    await expectAsync(waitingBaseHarness.withTimeout(EMITTER_DELAY).expectElementVisible(elementNotVisibleUnlessWaitingId, true)).toBeRejected()
    subscription.unsubscribe()
  })
})
