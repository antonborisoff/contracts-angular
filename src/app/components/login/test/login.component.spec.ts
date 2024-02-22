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
} from '../../../services/auth.service'
import {
  of,
  throwError
} from 'rxjs'
import {
  HttpErrorResponse
} from '@angular/common/http'

describe('LoginComponent', () => {
  let loginHarness: LoginHarness
  const INVALID_LOGIN = 'invalid_login'

  beforeEach(async () => {
    const authServiceMock = jasmine.createSpyObj<AuthService>('authService', ['login'])
    authServiceMock.login.and.callFake((login: string) => {
      if (login === INVALID_LOGIN) {
        return throwError(() => new HttpErrorResponse({
          status: 403
        }))
      }
      else {
        return of()
      }
    })
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        getTranslocoTestingModule(LoginComponent, en)
      ],
      providers: [{
        provide: AuthService,
        useValue: authServiceMock
      }]
    }).compileComponents()

    const fixture = TestBed.createComponent(LoginComponent)
    loginHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, LoginHarness)
  })

  it('should enable/disable login button based on form validity', async () => {
    // initial state
    // invalid form: login missing, password missing
    expect(await loginHarness.buttonEnabled('loginButton')).toBe(false)

    // invalid form: login present, password missing
    await loginHarness.enterInputValue('loginInput', 'my_login')
    expect(await loginHarness.buttonEnabled('loginButton')).toBe(false)

    // valid form: login present, password present
    await loginHarness.enterInputValue('passwordInput', 'my_password')
    expect(await loginHarness.buttonEnabled('loginButton')).toBe(true)

    // valid form: login present, password present (whitespaces are not ignored for password)
    await loginHarness.enterInputValue('passwordInput', ' ')
    expect(await loginHarness.buttonEnabled('loginButton')).toBe(true)

    // invalid form: login missing, password present
    await loginHarness.enterInputValue('loginInput', '')
    expect(await loginHarness.buttonEnabled('loginButton')).toBe(false)

    // invalid form: login missing, password present (whitespaces are ignored for login)
    await loginHarness.enterInputValue('loginInput', ' ')
    expect(await loginHarness.buttonEnabled('loginButton')).toBe(false)
  })

  it('should display/hide error message based on login validity', async () => {
    // initial state: no validation done
    expect(await loginHarness.controlPresent('loginErrorEmpty')).toBe(false)

    // validation is not triggered until blur
    await loginHarness.enterInputValue('loginInput', '', false)
    expect(await loginHarness.controlPresent('loginErrorEmpty')).toBe(false)

    await loginHarness.enterInputValue('loginInput', '')
    expect(await loginHarness.controlPresent('loginErrorEmpty')).toBe(true)

    await loginHarness.enterInputValue('loginInput', 'my_login')
    expect(await loginHarness.controlPresent('loginErrorEmpty')).toBe(false)

    // whitespaces are ignored
    await loginHarness.enterInputValue('loginInput', ' ')
    expect(await loginHarness.controlPresent('loginErrorEmpty')).toBe(true)
  })

  it('should display/hide error message based on password validity', async () => {
    // initial state: no validation done
    expect(await loginHarness.controlPresent('passwordErrorEmpty')).toBe(false)

    // validation is not triggered until blur
    await loginHarness.enterInputValue('passwordInput', '', false)
    expect(await loginHarness.controlPresent('passwordErrorEmpty')).toBe(false)

    await loginHarness.enterInputValue('passwordInput', '')
    expect(await loginHarness.controlPresent('passwordErrorEmpty')).toBe(true)

    await loginHarness.enterInputValue('passwordInput', 'my_password')
    expect(await loginHarness.controlPresent('passwordErrorEmpty')).toBe(false)

    // whitespaces are not ignored
    await loginHarness.enterInputValue('passwordInput', ' ')
    expect(await loginHarness.controlPresent('passwordErrorEmpty')).toBe(false)
  })

  it('should display error message in case of invalid credentials', async () => {
    expect(await loginHarness.controlPresent('incorrectCreds')).toBe(false)

    await loginHarness.enterInputValue('loginInput', INVALID_LOGIN)
    await loginHarness.enterInputValue('passwordInput', 'my_password')
    await loginHarness.clickButton('loginButton')
    expect(await loginHarness.controlPresent('incorrectCreds')).toBe(true)
  })
})
