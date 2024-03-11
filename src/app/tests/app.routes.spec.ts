import {
  TestBed
} from '@angular/core/testing'
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
import {
  BehaviorSubject
} from 'rxjs'
import {
  AuthService
} from '../services/auth/auth.service'
import {
  Utilities
} from './foundation/utilities'

describe('App navigation', () => {
  let isAuthMock: BehaviorSubject<boolean>
  let routerHarness: RouterTestingHarness

  beforeEach(async () => {
    isAuthMock = new BehaviorSubject(true)
    const authServiceMock = jasmine.createSpyObj<AuthService>('authService', ['isAuth'])
    authServiceMock.isAuth.and.returnValue(isAuthMock)

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(stubRouteComponents(routes))],
      providers: [{
        provide: AuthService,
        useValue: authServiceMock
      }]
    }).compileComponents()

    routerHarness = await RouterTestingHarness.create()
  })

  it('authenticated user - redirected to home page by default', async () => {
    isAuthMock.next(true)

    await routerHarness.navigateByUrl('/')
    expect(Utilities.getLocationPath()).toBe('/home')
  })

  it('authenticated user - redirected to home page when trying to open login page', async () => {
    isAuthMock.next(true)

    await routerHarness.navigateByUrl('/login')
    expect(Utilities.getLocationPath()).toBe('/home')
  })

  it('authenticated user - could access non-login page', async () => {
    isAuthMock.next(true)

    await routerHarness.navigateByUrl('/home')
    expect(Utilities.getLocationPath()).toBe('/home')
  })

  it('authenticated user - unknown path handling should be configured', async () => {
    isAuthMock.next(true)

    await expectAsync(routerHarness.navigateByUrl('/unknownRoute')).toBeResolved()
  })

  it('non-authenticated user - redirected to login page by default', async () => {
    isAuthMock.next(false)

    await routerHarness.navigateByUrl('/')
    expect(Utilities.getLocationPath()).toBe('/login')
  })

  it('non-authenticated user - redirected to login page when trying to open non-login page', async () => {
    isAuthMock.next(false)

    await routerHarness.navigateByUrl('/home')
    expect(Utilities.getLocationPath()).toBe('/login')
  })

  it('non-authenticated user - could access login page', async () => {
    isAuthMock.next(false)

    await routerHarness.navigateByUrl('/login')
    expect(Utilities.getLocationPath()).toBe('/login')
  })

  it('non-authenticated user - unknown path redirects to login page', async () => {
    isAuthMock.next(false)

    await routerHarness.navigateByUrl('/unknownRoute')
    expect(Utilities.getLocationPath()).toBe('/login')
  })
})
