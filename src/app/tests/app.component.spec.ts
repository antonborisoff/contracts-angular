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
    await expectAsync(harnesses.router.component.messageBoxPresent(MessageType.ERROR)).toBeResolvedTo(true)
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

    await harnesses.router.component.clickElement('navToHomeLink')
    expect(Utilities.getLocationPath()).toBe('/home')
  })

  it('change app language', async () => {
    const {
      harnesses
    } = await initComponent()

    // initial language (see karma.conf.js)
    await expectAsync(harnesses.router.component.elementText('activeLanguageText')).toBeResolvedTo('en')
    await expectAsync(harnesses.router.component.matButtonText('logoutButton')).toBeResolvedTo('Logout')

    await harnesses.router.component.clickElement('languageContainer')
    await harnesses.router.component.selectMatMenuItem('ru')

    await expectAsync(harnesses.router.component.elementText('activeLanguageText')).toBeResolvedTo('ru')
    await expectAsync(harnesses.router.component.matButtonText('logoutButton')).toBeResolvedTo('Выйти')
  })
})
