import {
  TestBed
} from '@angular/core/testing'
import {
  Router
} from '@angular/router'
import {
  RouterTestingHarness,
  RouterTestingModule
} from '@angular/router/testing'
import {
  routes
} from '../app.routes'
import {
  stubRouteComponents
} from './utils'

describe('App navigation', () => {
  let routerHarness: RouterTestingHarness
  let router: Router

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(stubRouteComponents(routes))],
      providers: []
    }).compileComponents()

    routerHarness = await RouterTestingHarness.create()
    router = TestBed.inject(Router)
  })

  it('navigate to home page by default', async () => {
    await routerHarness.navigateByUrl('/')
    expect(router.url).toBe('/home')
  })

  it('unknown path handling should be configured', async () => {
    await expectAsync(routerHarness.navigateByUrl('/unknownRoute')).toBeResolved()
  })
})
