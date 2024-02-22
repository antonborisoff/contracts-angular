import {
  TestBed
} from '@angular/core/testing'

import {
  NotFoundComponent
} from '../not-found.component'
import {
  getTranslocoTestingModule
} from '../../../../transloco/transloco-testing'
import en from '../i18n/en.json'
import {
  TestbedHarnessEnvironment
} from '@angular/cdk/testing/testbed'
import {
  NotFoundHarness
} from './not-found.component.harness'

describe('NotFoundComponent', () => {
  let notFoundHarness: NotFoundHarness

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NotFoundComponent,
        getTranslocoTestingModule(NotFoundComponent, en)
      ],
      providers: []
    }).compileComponents()

    const fixture = TestBed.createComponent(NotFoundComponent)
    notFoundHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, NotFoundHarness)
  })

  it('should display "not found" message', async () => {
    expect(await notFoundHarness.controlPresent('notFoundMessage')).toBe(true)
  })
})
