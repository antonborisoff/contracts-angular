import {
  TestBed
} from '@angular/core/testing'
import {
  AppComponent
} from '../app.component'
import {
  getTranslocoTestingModule
} from '../../transloco/transloco-testing'
import en from '../i18n/en.json'
import {
  AppHarness
} from './app.component.harness'
import {
  Router
} from '@angular/router'
import {
  BehaviorSubject,
  of,
  throwError
} from 'rxjs'
import {
  RouterTestingModule
} from '@angular/router/testing'
import {
  AuthService
} from '../services/auth/auth.service'
import {
  TestbedHarnessEnvironment
} from '@angular/cdk/testing/testbed'
import {
  BackendErrorHandlerService
} from '../services/backend-error-handler/backend-error-handler.service'
import {
  TestComponent
} from './utils'
import {
  Location
} from '@angular/common'

describe('AppComponent', () => {
  let isAuthMock: BehaviorSubject<boolean>
  let authServiceMock: jasmine.SpyObj<AuthService>
  let backendErrorHandlerServiceMock: jasmine.SpyObj<BackendErrorHandlerService>

  async function initComponent(): Promise<{
    appHarness: AppHarness
  }> {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        getTranslocoTestingModule(AppComponent, en),
        RouterTestingModule.withRoutes([
          {
            path: 'home',
            component: TestComponent
          },
          {
            path: 'non-home',
            component: TestComponent
          },
          {
            path: 'home/subhome',
            component: TestComponent
          },
          {
            path: 'login',
            component: TestComponent
          }
        ])
      ],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock
        },
        {
          provide: BackendErrorHandlerService,
          useValue: backendErrorHandlerServiceMock
        }
      ]
    }).compileComponents()

    const fixture = TestBed.createComponent(AppComponent)
    const appHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, AppHarness)
    return {
      appHarness
    }
  }

  beforeEach(async () => {
    isAuthMock = new BehaviorSubject(true)
    authServiceMock = jasmine.createSpyObj<AuthService>('authService', [
      'logout',
      'isAuth'
    ])
    authServiceMock.isAuth.and.returnValue(isAuthMock)
    authServiceMock.logout.and.returnValue(of(undefined))

    backendErrorHandlerServiceMock = jasmine.createSpyObj<BackendErrorHandlerService>('backendErrorHandler', ['handleError'])
  })

  it('display translated welcome message', async () => {
    const {
      appHarness
    } = await initComponent()

    expect(await appHarness.elementText('welcomeMessage')).toBe('Hello, contracts-angular component en')
  })

  it('navigate to login on successful logout', async () => {
    const {
      appHarness
    } = await initComponent()

    await appHarness.clickButton('logoutButton')
    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/login')
  })

  it('handle backend error during logout', async () => {
    authServiceMock.logout.and.returnValue(throwError(() => {
      return new Error('some error')
    }))
    const {
      appHarness
    } = await initComponent()

    await appHarness.clickButton('logoutButton')
    expect(backendErrorHandlerServiceMock.handleError).toHaveBeenCalledWith()
  })

  it('display header only to authenticated user', async () => {
    const {
      appHarness
    } = await initComponent()

    expect(await appHarness.elementVisible('appHeader')).toBe(true)

    isAuthMock.next(false)
    expect(await appHarness.elementVisible('appHeader')).toBe(false)

    isAuthMock.next(true)
    expect(await appHarness.elementVisible('appHeader')).toBe(true)
  })

  it('display go home link on non-home page only', async () => {
    const {
      appHarness
    } = await initComponent()
    const router = TestBed.inject(Router)

    await router.navigate(['non-home'])
    expect(await appHarness.elementVisible('navToHomeLink')).toBe(true)

    await router.navigate(['/home'])
    expect(await appHarness.elementVisible('navToHomeLink')).toBe(false)

    await router.navigate(['/home/subhome'])
    expect(await appHarness.elementVisible('navToHomeLink')).toBe(true)
  })

  it('navigate to home page on link click', async () => {
    const {
      appHarness
    } = await initComponent()

    await appHarness.clickLink('navToHomeLink')
    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/home')
  })
})
