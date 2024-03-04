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
import {
  Router
} from '@angular/router'

describe('NotFoundComponent', () => {
  async function initComponent(): Promise<{
    notFoundHarness: NotFoundHarness
    router: Router
  }> {
    await TestBed.configureTestingModule({
      imports: [
        NotFoundComponent,
        getTranslocoTestingModule(NotFoundComponent, en),
        RouterTestingModule.withRoutes([])
      ],
      providers: []
    }).compileComponents()

    const router = TestBed.inject(Router)

    const fixture = TestBed.createComponent(NotFoundComponent)
    const notFoundHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, NotFoundHarness)
    return {
      notFoundHarness,
      router
    }
  }

  it('display "not found" message', async () => {
    const {
      notFoundHarness
    } = await initComponent()

    expect(await notFoundHarness.elementVisible('notFoundMessage')).toBe(true)
  })
})
