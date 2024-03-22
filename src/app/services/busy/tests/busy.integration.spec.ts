import {
  TestBed
} from '@angular/core/testing'
import {
  TestbedHarnessEnvironment
} from '@angular/cdk/testing/testbed'
import {
  Subject
} from 'rxjs'
import {
  BusyStateService
} from '../busy-state.service'
import {
  TestComponent,
  TestComponentHarness
} from './busy-state.test.utils'

describe('BusyDirective + processLoading', () => {
  let harness: TestComponentHarness
  let busyStateService: BusyStateService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    }).compileComponents()

    const fixture = TestBed.createComponent(TestComponent)
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TestComponentHarness)
    busyStateService = TestBed.inject(BusyStateService)
  })

  it('appBusy + processLoading - stream completes', async () => {
    const subject = new Subject<boolean>()
    const stream = subject.pipe(
      busyStateService.processLoading('busy-element')
    )

    await harness.expectElementBusy('test-element-a', false)
    await harness.expectElementBusy('test-element-b', false)

    stream.subscribe()
    await harness.expectElementBusy('test-element-a', true)
    await harness.expectElementBusy('test-element-b', false)

    subject.complete()
    await harness.expectElementBusy('test-element-a', false)
    await harness.expectElementBusy('test-element-b', false)
  })

  it('appBusy + processLoading - stream terminates with error', async () => {
    const subject = new Subject<boolean>()
    const stream = subject.pipe(
      busyStateService.processLoading('busy-element')
    )

    await harness.expectElementBusy('test-element-a', false)
    await harness.expectElementBusy('test-element-b', false)

    stream.subscribe({
      // needed to prevent error from being thrown out to Jasmine
      error: () => {}
    })
    await harness.expectElementBusy('test-element-a', true)
    await harness.expectElementBusy('test-element-b', false)

    subject.error(new Error('something went wrong'))
    await harness.expectElementBusy('test-element-a', false)
    await harness.expectElementBusy('test-element-b', false)
  })
})
