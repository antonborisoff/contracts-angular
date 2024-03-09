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
  of
} from 'rxjs'
import {
  RouterTestingModule
} from '@angular/router/testing'
import {
  TestComponent,
  throwBackendError
} from '../../../tests/utils'
import {
  Location
} from '@angular/common'
import {
  Utilities
} from '../../../tests/foundation/utilities'

describe('LoginComponent', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>
  const VALID_CREDS = {
    login: 'my_login',
    password: 'my_password'
  }

  async function initComponent(): Promise<{
    loginHarness: LoginHarness
  }> {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        getTranslocoTestingModule(LoginComponent, en),
        RouterTestingModule.withRoutes([{
          path: 'home',
          component: TestComponent
        }])
      ],
      providers: [{
        provide: AuthService,
        useValue: authServiceMock
      }]
    }).compileComponents()

    const fixture = TestBed.createComponent(LoginComponent)
    const loginHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, LoginHarness)
    return {
      loginHarness
    }
  }

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj<AuthService>('authService', ['login'])
    authServiceMock.login.withArgs(VALID_CREDS.login, VALID_CREDS.password).and.returnValue(of(void 0))
    authServiceMock.login.and.returnValue(throwBackendError(403))
  })

  it('enable/disable login button based on form validity', async () => {
    const {
      loginHarness
    } = await initComponent()

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
    const {
      loginHarness
    } = await initComponent()

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
    const {
      loginHarness
    } = await initComponent()

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
    const {
      loginHarness
    } = await initComponent()

    expect(await loginHarness.elementVisible('incorrectCreds')).toBe(false)

    await loginHarness.enterValue('loginInput', `${VALID_CREDS.login}_invalid`)
    await loginHarness.enterValue('passwordInput', VALID_CREDS.password)
    await loginHarness.clickButton('loginButton')
    expect(await loginHarness.elementVisible('incorrectCreds')).toBe(true)
  })

  it('navigate to home on successful login', async () => {
    const {
      loginHarness
    } = await initComponent()

    await loginHarness.enterValue('loginInput', VALID_CREDS.login)
    await loginHarness.enterValue('passwordInput', VALID_CREDS.password)
    await loginHarness.clickButton('loginButton')
    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/home')
  })

  it('handle backend error during login', async () => {
    authServiceMock.login.withArgs(VALID_CREDS.login, VALID_CREDS.password).and.returnValue(throwBackendError(500))
    const {
      loginHarness
    } = await initComponent()

    expect(await Utilities.errorMessageBoxPresent(async () => {
      await loginHarness.enterValue('loginInput', VALID_CREDS.login)
      await loginHarness.enterValue('passwordInput', VALID_CREDS.password)
      await loginHarness.clickButton('loginButton')
    })).toBe(true)
  })
})
