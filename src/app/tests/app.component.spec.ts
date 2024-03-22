import {
  AppComponent
} from '../app.component'
import en from '../i18n/en.json'
import ru from '../i18n/ru.json'
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
import {
  MessageType
} from '../services/message-box/interfaces'

describe('AppComponent', () => {
  let isAuthMock: BehaviorSubject<boolean>
  let authServiceMock: jasmine.SpyObj<AuthService>

  async function initComponent(): ComponentHarnessAndUtils<AppHarness> {
    return initComponentBase(AppComponent, AppHarness, {
      en: en,
      ru: ru
    }, {
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

  it('navigate to login on successful logout', async () => {
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.component.clickElement('logoutButton')
    expect(Utilities.getLocationPath()).toBe('/login')
  })

  it('handle backend error during logout', async () => {
    authServiceMock.logout.and.returnValue(throwBackendError())
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.component.clickElement('logoutButton')
    await harnesses.router.component.expectMessageBoxPresent(MessageType.ERROR)
  })

  it('display header only to authenticated user', async () => {
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.component.expectElementVisible('appHeader', true)

    isAuthMock.next(false)
    await harnesses.router.component.expectElementVisible('appHeader', false)

    isAuthMock.next(true)
    await harnesses.router.component.expectElementVisible('appHeader', true)
  })

  it('display go home link on non-home page only', async () => {
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.navigateByUrl('/non-home')
    await harnesses.router.component.expectElementVisible('navToHomeLink', true)

    await harnesses.router.navigateByUrl('/home')
    await harnesses.router.component.expectElementVisible('navToHomeLink', false)

    await harnesses.router.navigateByUrl('/home/subhome')
    await harnesses.router.component.expectElementVisible('navToHomeLink', true)
  })

  it('navigate to home page on link click', async () => {
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.component.clickElement('navToHomeLink')
    expect(Utilities.getLocationPath()).toBe('/home')
  })

  it('change app language', async () => {
    const {
      harnesses
    } = await initComponent()

    // initial language (see karma.conf.js)
    await harnesses.router.component.expectElementText('activeLanguageText', 'en')
    await harnesses.router.component.expectMatButtonText('logoutButton', 'Logout')

    await harnesses.router.component.clickElement('languageContainer')
    await harnesses.router.component.selectMatMenuItem('ru')

    await harnesses.router.component.expectElementText('activeLanguageText', 'ru')
    await harnesses.router.component.expectMatButtonText('logoutButton', 'Выйти')
  })
})
