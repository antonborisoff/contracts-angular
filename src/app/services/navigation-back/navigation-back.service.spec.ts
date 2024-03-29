import {
  TestBed
} from '@angular/core/testing'

import {
  NavigationBackService
} from './navigation-back.service'
import {
  RouterTestingHarness,
  RouterTestingModule
} from '@angular/router/testing'
import {
  TestComponent
} from '../../tests/utils'
import {
  Utilities
} from '../../tests/foundation/utilities'

describe('NavigationBackService', () => {
  let service: NavigationBackService
  let routerHarness: RouterTestingHarness

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([
        {
          path: '',
          redirectTo: 'home',
          pathMatch: 'full'
        },
        {
          path: 'home',
          component: TestComponent
        },
        {
          path: 'base',
          component: TestComponent
        },
        {
          path: 'route_a',
          component: TestComponent
        },
        {
          path: 'route_b',
          component: TestComponent
        }
      ])]
    })
    routerHarness = await RouterTestingHarness.create()
    service = TestBed.inject(NavigationBackService)
  })

  it('back', async () => {
    await routerHarness.navigateByUrl('/base')
    await routerHarness.navigateByUrl('/route_a')
    await routerHarness.navigateByUrl('/route_b')

    await service.back()
    expect(Utilities.getLocationPath()).toBe('/route_a')

    await service.back()
    expect(Utilities.getLocationPath()).toBe('/base')

    await service.back()
    expect(Utilities.getLocationPath()).toBe('/home')
  })
})
