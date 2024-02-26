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
    await expectAsync(baseHarness.clickButton('enabled-button')).toBeResolved()
    expect(testComponent.isElementClicked('enabled-button')).toBe(true)

    await expectAsync(baseHarness.clickButton('disabled-button')).toBeRejected()
    expect(testComponent.isElementClicked('disabled-button')).toBe(false)

    await expectAsync(baseHarness.clickButton('non-existent-button')).toBeRejected()
  })

  it('buttonEnabled', async () => {
    await expectAsync(baseHarness.buttonEnabled('enabled-button')).toBeResolvedTo(true)
    await expectAsync(baseHarness.buttonEnabled('disabled-button')).toBeResolvedTo(false)
    await expectAsync(baseHarness.buttonEnabled('non-existent-button')).toBeRejected()
  })

  it('clickLink', async () => {
    await expectAsync(baseHarness.clickLink('link')).toBeResolved()
    expect(testComponent.isElementClicked('link')).toBe(true)

    await expectAsync(baseHarness.clickLink('non-existent-link')).toBeRejected()
  })
})
