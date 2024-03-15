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

    expect(await harness.elementBusy('test-element-a')).toBe(false)
    expect(await harness.elementBusy('test-element-b')).toBe(false)

    stream.subscribe()
    expect(await harness.elementBusy('test-element-a')).toBe(true)
    expect(await harness.elementBusy('test-element-b')).toBe(false)

    subject.complete()
    expect(await harness.elementBusy('test-element-a')).toBe(false)
    expect(await harness.elementBusy('test-element-b')).toBe(false)
  })

  it('appBusy + processLoading - stream terminates with error', async () => {
    const subject = new Subject<boolean>()
    const stream = subject.pipe(
      busyStateService.processLoading('busy-element')
    )

    expect(await harness.elementBusy('test-element-a')).toBe(false)
    expect(await harness.elementBusy('test-element-b')).toBe(false)

    stream.subscribe({
      // needed to prevent error from being thrown out to Jasmine
      error: () => {}
    })
    expect(await harness.elementBusy('test-element-a')).toBe(true)
    expect(await harness.elementBusy('test-element-b')).toBe(false)

    subject.error(new Error('something went wrong'))
    expect(await harness.elementBusy('test-element-a')).toBe(false)
    expect(await harness.elementBusy('test-element-b')).toBe(false)
  })
})
