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
  MessageBoxService
} from '../services/message-box/message-box.service'

describe('AppComponent', () => {
  let isAuthMock: BehaviorSubject<boolean>
  let authServiceMock: jasmine.SpyObj<AuthService>
  let messageBoxServiceMock: jasmine.SpyObj<MessageBoxService>

  async function initComponent(): Promise<{
    appHarness: AppHarness
    router: Router
  }> {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        getTranslocoTestingModule(AppComponent, en),
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock
        },
        {
          provide: MessageBoxService,
          useValue: messageBoxServiceMock
        }
      ]
    }).compileComponents()

    const router = TestBed.inject(Router)

    const fixture = TestBed.createComponent(AppComponent)
    const appHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, AppHarness)
    return {
      appHarness,
      router
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

    messageBoxServiceMock = jasmine.createSpyObj<MessageBoxService>('messageBoxService', ['error'])
  })

  it('display translated welcome message', async () => {
    const {
      appHarness
    } = await initComponent()

    expect(await appHarness.elementText('welcomeMessage')).toBe('Hello, contracts-angular component en')
  })

  it('navigate to login on successful logout', async () => {
    const {
      appHarness, router
    } = await initComponent()
    const navigateSpy = spyOn<Router, 'navigate'>(router, 'navigate')

    await appHarness.clickButton('logoutButton')
    expect(navigateSpy).toHaveBeenCalledWith(['/login'])
  })

  it('display translated error message on failed logout', async () => {
    authServiceMock.logout.and.returnValue(throwError(() => {
      return new Error('some error')
    }))
    const {
      appHarness
    } = await initComponent()

    await appHarness.clickButton('logoutButton')
    expect(messageBoxServiceMock.error).toHaveBeenCalledWith('Failed to logout.')
  })

  it('display welcome message and logout button only to authenticated user', async () => {
    const {
      appHarness
    } = await initComponent()

    expect(await appHarness.elementVisible('welcomeMessage')).toBe(true)
    expect(await appHarness.elementVisible('logoutButton')).toBe(true)

    isAuthMock.next(false)
    expect(await appHarness.elementVisible('welcomeMessage')).toBe(false)
    expect(await appHarness.elementVisible('logoutButton')).toBe(false)

    isAuthMock.next(true)
    expect(await appHarness.elementVisible('welcomeMessage')).toBe(true)
    expect(await appHarness.elementVisible('logoutButton')).toBe(true)
  })
})
