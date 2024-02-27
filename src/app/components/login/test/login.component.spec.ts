import {
  TestBed
} from '@angular/core/testing'

import {
  LoginComponent
} from '../login.component'
import {
  getTranslocoTestingModule
} from '../../../../transloco/transloco-testing'
import en from '../i18n/en.json'
import {
  TestbedHarnessEnvironment
} from '@angular/cdk/testing/testbed'
import {
  LoginHarness
} from './login.component.harness'
import {
  AuthService
} from '../../../services/auth/auth.service'
import {
  of,
  throwError
} from 'rxjs'
import {
  HttpErrorResponse
} from '@angular/common/http'
import {
  RouterTestingModule
} from '@angular/router/testing'
import {
  Router
} from '@angular/router'
import {
  MessageBoxService
} from '../../../services/message-box/message-box.service'

describe('LoginComponent', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>
  let messageBoxServiceMock: jasmine.SpyObj<MessageBoxService>
  let loginHarness: LoginHarness
  let router: Router
  const VALID_CREDS = {
    login: 'my_login',
    password: 'my_password'
  }

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj<AuthService>('authService', ['login'])
    authServiceMock.login.and.callFake((login: string, password: string) => {
      if (login === VALID_CREDS.login && password === VALID_CREDS.password) {
        return of(undefined)
      }
      else {
        return throwError(() => new HttpErrorResponse({
          status: 403
        }))
      }
    })

    messageBoxServiceMock = jasmine.createSpyObj<MessageBoxService>('messageBoxService', ['error'])

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        getTranslocoTestingModule(LoginComponent, en),
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

    const fixture = TestBed.createComponent(LoginComponent)
    loginHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, LoginHarness)
    router = TestBed.inject(Router)
  })

  it('enable/disable login button based on form validity', async () => {
    // initial state
    // invalid form: login missing, password missing
    expect(await loginHarness.buttonEnabled('loginButton')).toBe(false)

    // invalid form: login present, password missing
    await loginHarness.enterValue('loginInput', 'my_login')
    expect(await loginHarness.buttonEnabled('loginButton')).toBe(false)

    // valid form: login present, password present
    await loginHarness.enterValue('passwordInput', 'my_password')
    expect(await loginHarness.buttonEnabled('loginButton')).toBe(true)

    // valid form: login present, password present (whitespaces are not ignored for password)
    await loginHarness.enterValue('passwordInput', ' ')
    expect(await loginHarness.buttonEnabled('loginButton')).toBe(true)

    // invalid form: login missing, password present
    await loginHarness.enterValue('loginInput', '')
    expect(await loginHarness.buttonEnabled('loginButton')).toBe(false)

    // invalid form: login missing, password present (whitespaces are ignored for login)
    await loginHarness.enterValue('loginInput', ' ')
    expect(await loginHarness.buttonEnabled('loginButton')).toBe(false)
  })

  it('display/hide error message based on login validity', async () => {
    // initial state: no validation done
    expect(await loginHarness.elementVisible('loginErrorEmpty')).toBe(false)

    // validation is not triggered until blur
    await loginHarness.enterValue('loginInput', '', false)
    expect(await loginHarness.elementVisible('loginErrorEmpty')).toBe(false)

    await loginHarness.enterValue('loginInput', '')
    expect(await loginHarness.elementVisible('loginErrorEmpty')).toBe(true)

    await loginHarness.enterValue('loginInput', 'my_login')
    expect(await loginHarness.elementVisible('loginErrorEmpty')).toBe(false)

    // whitespaces are ignored
    await loginHarness.enterValue('loginInput', ' ')
    expect(await loginHarness.elementVisible('loginErrorEmpty')).toBe(true)
  })

  it('display/hide error message based on password validity', async () => {
    // initial state: no validation done
    expect(await loginHarness.elementVisible('passwordErrorEmpty')).toBe(false)

    // validation is not triggered until blur
    await loginHarness.enterValue('passwordInput', '', false)
    expect(await loginHarness.elementVisible('passwordErrorEmpty')).toBe(false)

    await loginHarness.enterValue('passwordInput', '')
    expect(await loginHarness.elementVisible('passwordErrorEmpty')).toBe(true)

    await loginHarness.enterValue('passwordInput', 'my_password')
    expect(await loginHarness.elementVisible('passwordErrorEmpty')).toBe(false)

    // whitespaces are not ignored
    await loginHarness.enterValue('passwordInput', ' ')
    expect(await loginHarness.elementVisible('passwordErrorEmpty')).toBe(false)
  })

  it('display error message in case of invalid credentials', async () => {
    expect(await loginHarness.elementVisible('incorrectCreds')).toBe(false)

    await loginHarness.enterValue('loginInput', `${VALID_CREDS.login}_invalid`)
    await loginHarness.enterValue('passwordInput', VALID_CREDS.password)
    await loginHarness.clickButton('loginButton')
    expect(await loginHarness.elementVisible('incorrectCreds')).toBe(true)
  })

  it('navigate to home on successful login', async () => {
    const navigateSpy = spyOn<Router, 'navigate'>(router, 'navigate')

    await loginHarness.enterValue('loginInput', VALID_CREDS.login)
    await loginHarness.enterValue('passwordInput', VALID_CREDS.password)
    await loginHarness.clickButton('loginButton')
    expect(navigateSpy).toHaveBeenCalledWith(['/home'])
  })

  it('display translated general error if something goes wrong during login', async () => {
    authServiceMock.login.and.callFake(() => {
      return throwError(() => new HttpErrorResponse({
        status: 500
      }))
    })

    await loginHarness.enterValue('loginInput', VALID_CREDS.login)
    await loginHarness.enterValue('passwordInput', VALID_CREDS.password)
    await loginHarness.clickButton('loginButton')
    expect(messageBoxServiceMock.error).toHaveBeenCalledWith('Something went wrong.')
  })
})
