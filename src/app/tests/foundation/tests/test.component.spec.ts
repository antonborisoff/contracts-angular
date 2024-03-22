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

describe('Base harnesses', () => {
  let baseHarness: TestComponentHarness
  let waitingBaseHarness: WaitingTestComponentHarness
  let testComponent: TestComponent

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestComponent,
        getTranslocoTestingModule(TestComponent, {})
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

  it('messageBoxPresent', async () => {
    await expectAsync(baseHarness.messageBoxPresent(MessageType.ERROR)).toBeResolvedTo(false)
    await expectAsync(baseHarness.messageBoxPresent(MessageType.CONFIRM)).toBeResolvedTo(false)

    await baseHarness.clickElement('button-triggers-message-box-error')
    await expectAsync(baseHarness.messageBoxPresent(MessageType.ERROR)).toBeResolvedTo(true)
    await expectAsync(baseHarness.messageBoxPresent(MessageType.ERROR, 'message box error')).toBeResolvedTo(true)
    await expectAsync(baseHarness.messageBoxPresent(MessageType.ERROR, 'some random message')).toBeResolvedTo(false)
    await expectAsync(baseHarness.messageBoxPresent(MessageType.CONFIRM)).toBeResolvedTo(false)
  })

  it('messageBoxClick', async () => {
    await expectAsync(baseHarness.messageBoxPresent(MessageType.ERROR)).toBeResolvedTo(false)

    await baseHarness.clickElement('button-triggers-message-box-error')
    await expectAsync(baseHarness.messageBoxPresent(MessageType.ERROR)).toBeResolvedTo(true)

    await baseHarness.messageBoxClick(MessageActions.CLOSE)
    await expectAsync(baseHarness.messageBoxPresent(MessageType.ERROR)).toBeResolvedTo(false)
  })

  it('messageBoxClick - no message box', async () => {
    await expectAsync(baseHarness.messageBoxPresent(MessageType.ERROR)).toBeResolvedTo(false)

    await expectAsync(baseHarness.messageBoxClick(MessageActions.CLOSE)).toBeRejectedWithError()
  })

  it('messageBoxClick - no message action', async () => {
    await baseHarness.clickElement('button-triggers-message-box-error')

    await expectAsync(baseHarness.messageBoxClick(MessageActions.CONFIRM)).toBeRejectedWithError()
  })

  const EMITTER_DELAY = 1000
  it('waiting harness - element free', async () => {
    const busyStateService = TestBed.inject(BusyStateService)
    const stream = defer(() => {
      return of(1).pipe(delay(EMITTER_DELAY))
    })
    const elementId = 'div-busy-element'

    await expectAsync(baseHarness.elementPresent(elementId, 'div')).toBeResolvedTo(true)

    stream.pipe(busyStateService.processLoading('div-busy')).subscribe()
    await expectAsync(baseHarness.elementBusy(elementId)).toBeResolvedTo(true)

    await waitingBaseHarness.expectElementFree(elementId)
    await expectAsync(baseHarness.elementBusy(elementId)).toBeResolvedTo(false)
  })

  it('waiting harness - element free - waiting timed out', async () => {
    const busyStateService = TestBed.inject(BusyStateService)
    const stream = defer(() => {
      return of(1).pipe(delay(EMITTER_DELAY * 2))
    })
    const elementId = 'div-busy-element'

    await expectAsync(baseHarness.elementPresent(elementId, 'div')).toBeResolvedTo(true)

    stream.pipe(busyStateService.processLoading('div-busy')).subscribe()
    await expectAsync(baseHarness.elementBusy(elementId)).toBeResolvedTo(true)

    // wait less than the delay in the stream
    await expectAsync(waitingBaseHarness.withTimeout(EMITTER_DELAY).expectElementFree(elementId)).toBeRejectedWithError(`Waiting for element ${elementId} becoming free failed: timeout exceeded, but element is still busy.`)
  })

  it('waiting harness - element present', async () => {
    const stream = defer(() => {
      return of(true).pipe(delay(EMITTER_DELAY))
    })
    const elementId = 'div-present-element'

    await expectAsync(baseHarness.elementPresent(elementId, 'div')).toBeResolvedTo(false)

    stream.subscribe(() => {
      testComponent.isPresent.next(true)
    })
    await expectAsync(baseHarness.elementPresent(elementId, 'div')).toBeResolvedTo(false)

    await waitingBaseHarness.expectElementPresent(elementId)
    await expectAsync(baseHarness.elementPresent(elementId, 'div')).toBeResolvedTo(true)
  })

  it('waiting harness - element present - waiting timed out', async () => {
    const stream = defer(() => {
      return of(true).pipe(delay(EMITTER_DELAY * 2))
    })
    const elementId = 'div-present-element'

    await expectAsync(baseHarness.elementPresent(elementId, 'div')).toBeResolvedTo(false)

    const subscription = stream.subscribe(() => {
      testComponent.isPresent.next(true)
    })
    await expectAsync(baseHarness.elementPresent(elementId, 'div')).toBeResolvedTo(false)

    // wait less than the delay in the stream
    await expectAsync(waitingBaseHarness.withTimeout(EMITTER_DELAY).expectElementPresent(elementId)).toBeRejectedWithError(`Waiting for element ${elementId} being present failed: timeout exceeded, but element is still not present.`)
    subscription.unsubscribe()
  })

  it('waiting harness - element not present', async () => {
    const stream = defer(() => {
      return of(true).pipe(delay(EMITTER_DELAY))
    })
    const elementId = 'div-not-present-element'

    await expectAsync(baseHarness.elementPresent(elementId, 'div')).toBeResolvedTo(true)

    stream.subscribe(() => {
      testComponent.isPresent.next(true)
    })
    await expectAsync(baseHarness.elementPresent(elementId, 'div')).toBeResolvedTo(true)

    await waitingBaseHarness.expectElementPresent(elementId, false)
    await expectAsync(baseHarness.elementPresent(elementId, 'div')).toBeResolvedTo(false)
  })

  it('waiting harness - element not present - waiting timed out', async () => {
    const stream = defer(() => {
      return of(true).pipe(delay(EMITTER_DELAY * 2))
    })
    const elementId = 'div-not-present-element'

    await expectAsync(baseHarness.elementPresent(elementId, 'div')).toBeResolvedTo(true)

    const subscription = stream.subscribe(() => {
      testComponent.isPresent.next(true)
    })
    await expectAsync(baseHarness.elementPresent(elementId, 'div')).toBeResolvedTo(true)

    // wait less than the delay in the stream
    await expectAsync(waitingBaseHarness.withTimeout(EMITTER_DELAY).expectElementPresent(elementId, false)).toBeRejectedWithError(`Waiting for element ${elementId} not being present failed: timeout exceeded, but element is still present.`)
    subscription.unsubscribe()
  })
})
