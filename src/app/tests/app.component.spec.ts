import {
  AppComponent
} from '../app.component'
import en from '../i18n/en.json'
import {
  AppHarness
} from './app.component.harness'
import {
  BehaviorSubject,
  of
} from 'rxjs'
import {
  AuthService
} from '../services/auth/auth.service'
import {
  ComponentHarnessAndUtils,
  initComponentBase,
  throwBackendError
} from './utils'
import {
  Utilities
} from './foundation/utilities'

describe('AppComponent', () => {
  let isAuthMock: BehaviorSubject<boolean>
  let authServiceMock: jasmine.SpyObj<AuthService>

  async function initComponent(): ComponentHarnessAndUtils<AppHarness> {
    return initComponentBase(AppComponent, AppHarness, en, {
      routePaths: [
        'home',
        'non-home',
        'home/subhome',
        'login'
      ],
      providers: [{
        provide: AuthService,
        useValue: authServiceMock
      }]
    })
  }

  beforeEach(async () => {
    isAuthMock = new BehaviorSubject(true)
    authServiceMock = jasmine.createSpyObj<AuthService>('authService', [
      'logout',
      'isAuth'
    ])
    authServiceMock.isAuth.and.returnValue(isAuthMock)
    authServiceMock.logout.and.returnValue(of(undefined))
  })

  it('display translated welcome message', async () => {
    const {
      harnesses
    } = await initComponent()

    expect(await harnesses.router.component.elementText('welcomeMessage')).toBe('Hello, contracts-angular component en')
  })

  it('navigate to login on successful logout', async () => {
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.component.clickButton('logoutButton')
    expect(Utilities.getLocationPath()).toBe('/login')
  })

  it('handle backend error during logout', async () => {
    authServiceMock.logout.and.returnValue(throwBackendError())
    const {
      harnesses
    } = await initComponent()

    expect (await Utilities.errorMessageBoxPresent(async () => {
      await harnesses.router.component.clickButton('logoutButton')
    })).toBe(true)
  })

  it('display header only to authenticated user', async () => {
    const {
      harnesses
    } = await initComponent()

    expect(await harnesses.router.component.elementVisible('appHeader')).toBe(true)

    isAuthMock.next(false)
    expect(await harnesses.router.component.elementVisible('appHeader')).toBe(false)

    isAuthMock.next(true)
    expect(await harnesses.router.component.elementVisible('appHeader')).toBe(true)
  })

  it('display go home link on non-home page only', async () => {
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.navigateByUrl('/non-home')
    expect(await harnesses.router.component.elementVisible('navToHomeLink')).toBe(true)

    await harnesses.router.navigateByUrl('/home')
    expect(await harnesses.router.component.elementVisible('navToHomeLink')).toBe(false)

    await harnesses.router.navigateByUrl('/home/subhome')
    expect(await harnesses.router.component.elementVisible('navToHomeLink')).toBe(true)
  })

  it('navigate to home page on link click', async () => {
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.component.clickLink('navToHomeLink')
    expect(Utilities.getLocationPath()).toBe('/home')
  })
})
