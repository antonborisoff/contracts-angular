import {
  LoginComponent
} from '../login.component'
import {
  LoginHarness
} from './login.component.harness'
import en from '../i18n/en.json'
import {
  AuthService
} from '../../../services/auth/auth.service'
import {
  of
} from 'rxjs'
import {
  ComponentHarnessAndUtils,
  initComponentBase,
  throwBackendError
} from '../../../tests/utils'
import {
  Utilities
} from '../../../tests/foundation/utilities'
import {
  MessageType
} from '../../../services/message-box/interfaces'

describe('LoginComponent', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>
  const VALID_CREDS = {
    login: 'my_login',
    password: 'my_password'
  }

  async function initComponent(): ComponentHarnessAndUtils<LoginHarness> {
    return initComponentBase(LoginComponent, LoginHarness, {
      en: en
    }, {
      routePaths: ['home'],
      providers: [{
        provide: AuthService,
        useValue: authServiceMock
      }]
    })
  }

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj<AuthService>('authService', ['login'])
    authServiceMock.login.withArgs(VALID_CREDS.login, VALID_CREDS.password).and.returnValue(of(void 0))
    authServiceMock.login.and.returnValue(throwBackendError(403))
  })

  it('enable/disable login button based on form validity', async () => {
    const {
      harnesses
    } = await initComponent()

    // initial state
    // invalid form: login missing, password missing
    await harnesses.router.component.expectButtonEnabled('loginButton', false)

    // invalid form: login present, password missing
    await harnesses.router.component.enterValue('loginInput', 'my_login')
    await harnesses.router.component.expectButtonEnabled('loginButton', false)

    // valid form: login present, password present
    await harnesses.router.component.enterValue('passwordInput', 'my_password')
    await harnesses.router.component.expectButtonEnabled('loginButton', true)

    // valid form: login present, password present (whitespaces are not ignored for password)
    await harnesses.router.component.enterValue('passwordInput', ' ')
    await harnesses.router.component.expectButtonEnabled('loginButton', true)

    // invalid form: login missing, password present
    await harnesses.router.component.enterValue('loginInput', '')
    await harnesses.router.component.expectButtonEnabled('loginButton', false)

    // invalid form: login missing, password present (whitespaces are ignored for login)
    await harnesses.router.component.enterValue('loginInput', ' ')
    await harnesses.router.component.expectButtonEnabled('loginButton', false)
  })

  it('display/hide error message based on login validity', async () => {
    const {
      harnesses
    } = await initComponent()

    // initial state: no validation done
    await harnesses.router.component.expectElementVisible('loginErrorEmpty', false)

    // validation is not triggered until blur
    await harnesses.router.component.enterValue('loginInput', '', false)
    await harnesses.router.component.expectElementVisible('loginErrorEmpty', false)

    await harnesses.router.component.enterValue('loginInput', '')
    await harnesses.router.component.expectElementVisible('loginErrorEmpty', true)

    await harnesses.router.component.enterValue('loginInput', 'my_login')
    await harnesses.router.component.expectElementVisible('loginErrorEmpty', false)

    // whitespaces are ignored
    await harnesses.router.component.enterValue('loginInput', ' ')
    await harnesses.router.component.expectElementVisible('loginErrorEmpty', true)
  })

  it('display/hide error message based on password validity', async () => {
    const {
      harnesses
    } = await initComponent()

    // initial state: no validation done
    await harnesses.router.component.expectElementVisible('passwordErrorEmpty', false)

    // validation is not triggered until blur
    await harnesses.router.component.enterValue('passwordInput', '', false)
    await harnesses.router.component.expectElementVisible('passwordErrorEmpty', false)

    await harnesses.router.component.enterValue('passwordInput', '')
    await harnesses.router.component.expectElementVisible('passwordErrorEmpty', true)

    await harnesses.router.component.enterValue('passwordInput', 'my_password')
    await harnesses.router.component.expectElementVisible('passwordErrorEmpty', false)

    // whitespaces are not ignored
    await harnesses.router.component.enterValue('passwordInput', ' ')
    await harnesses.router.component.expectElementVisible('passwordErrorEmpty', false)
  })

  it('display error message in case of invalid credentials', async () => {
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.component.expectElementVisible('incorrectCreds', false)

    await harnesses.router.component.enterValue('loginInput', `${VALID_CREDS.login}_invalid`)
    await harnesses.router.component.enterValue('passwordInput', VALID_CREDS.password)
    await harnesses.router.component.clickElement('loginButton')
    await harnesses.router.component.expectElementVisible('incorrectCreds', true)
  })

  it('navigate to home on successful login', async () => {
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.component.enterValue('loginInput', VALID_CREDS.login)
    await harnesses.router.component.enterValue('passwordInput', VALID_CREDS.password)
    await harnesses.router.component.clickElement('loginButton')
    expect(Utilities.getLocationPath()).toBe('/home')
  })

  it('handle backend error during login', async () => {
    authServiceMock.login.withArgs(VALID_CREDS.login, VALID_CREDS.password).and.returnValue(throwBackendError(500))
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.component.enterValue('loginInput', VALID_CREDS.login)
    await harnesses.router.component.enterValue('passwordInput', VALID_CREDS.password)
    await harnesses.router.component.clickElement('loginButton')
    await harnesses.router.component.expectMessageBoxPresent(MessageType.ERROR)
  })

  it('show/hide password', async () => {
    const {
      harnesses
    } = await initComponent()

    // initial state
    expect(await harnesses.router.component.inputType('passwordInput')).toBe('password')
    await harnesses.router.component.expectElementText('togglePasswordButtonIcon', 'visibility_off')

    await harnesses.router.component.clickElement('togglePasswordButton')
    expect(await harnesses.router.component.inputType('passwordInput')).toBe('text')
    await harnesses.router.component.expectElementText('togglePasswordButtonIcon', 'visibility')

    await harnesses.router.component.clickElement('togglePasswordButton')
    expect(await harnesses.router.component.inputType('passwordInput')).toBe('password')
    await harnesses.router.component.expectElementText('togglePasswordButtonIcon', 'visibility_off')
  })
})
