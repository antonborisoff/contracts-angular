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
  let notFoundHarness: NotFoundHarness
  let router: Router

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NotFoundComponent,
        getTranslocoTestingModule(NotFoundComponent, en),
        RouterTestingModule.withRoutes([])
      ],
      providers: []
    }).compileComponents()

    const fixture = TestBed.createComponent(NotFoundComponent)
    notFoundHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, NotFoundHarness)
    router = TestBed.inject(Router)
  })

  it('display "not found" message', async () => {
    expect(await notFoundHarness.controlPresent('notFoundMessage')).toBe(true)
  })

  it('navigate to home page on link click', async () => {
    const navigateByUrlSpy = spyOn<Router, 'navigateByUrl'>(router, 'navigateByUrl')

    await notFoundHarness.clickLink('navToHomeLink')
    expect(navigateByUrlSpy).toHaveBeenCalledWith(router.createUrlTree(['/home']), jasmine.anything())
  })
})
