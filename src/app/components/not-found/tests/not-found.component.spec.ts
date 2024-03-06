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
import {
  RouterTestingModule
} from '@angular/router/testing'

describe('NotFoundComponent', () => {
  async function initComponent(): Promise<{
    notFoundHarness: NotFoundHarness
  }> {
    await TestBed.configureTestingModule({
      imports: [
        NotFoundComponent,
        getTranslocoTestingModule(NotFoundComponent, en),
        RouterTestingModule.withRoutes([])
      ],
      providers: []
    }).compileComponents()

    const fixture = TestBed.createComponent(NotFoundComponent)
    const notFoundHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, NotFoundHarness)
    return {
      notFoundHarness
    }
  }

  it('display "not found" message', async () => {
    const {
      notFoundHarness
    } = await initComponent()

    expect(await notFoundHarness.elementVisible('notFoundMessage')).toBe(true)
  })
})
