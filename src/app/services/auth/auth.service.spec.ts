import {
  TestBed
} from '@angular/core/testing'
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest
} from '@angular/common/http/testing'
import {
  AuthService
} from './auth.service'
import {
  FeatureToggleService
} from '../features/feature-toggle.service'

describe('AuthService', () => {
  let service: AuthService
  let featureToggleServiceMock: jasmine.SpyObj<FeatureToggleService>
  let httpTestingController: HttpTestingController
  const CREDS = {
    login: 'my_login',
    password: 'my_password'
  }
  const LOGIN_RETURN = {
    token: 'token',
    activeFeatures: ['FT_Active_Feature']
  }

  beforeEach(() => {
    localStorage.clear()
    featureToggleServiceMock = jasmine.createSpyObj<FeatureToggleService>('featureToggleService', ['init'])
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{
        provide: FeatureToggleService,
        useValue: featureToggleServiceMock
      }]
    })
    httpTestingController = TestBed.inject(HttpTestingController)
    service = TestBed.inject(AuthService)
  })

  afterEach(() => {
    httpTestingController.verify()
    localStorage.clear()
  })

  it('login dispatches request properly', () => {
    service.login(CREDS.login, CREDS.password).subscribe()
    const testRequest = httpTestingController.expectOne('/api/auth/login')

    expect(testRequest.request.method).toBe('POST')
    expect(testRequest.request.body).toEqual(jasmine.objectContaining({
      login: CREDS.login,
      password: CREDS.password
    }))
  })

  it('login initializes feature toggle service', () => {
    service.login(CREDS.login, CREDS.password).subscribe()
    const testRequest = httpTestingController.expectOne('/api/auth/login')

    testRequest.flush(LOGIN_RETURN)
    expect(featureToggleServiceMock.init).toHaveBeenCalledWith(LOGIN_RETURN.activeFeatures)
  })

  it('logout dispatches request properly', () => {
    service.logout().subscribe()
    const testRequest = httpTestingController.expectOne('/api/auth/logout')

    expect(testRequest.request.method).toBe('POST')
    expect(testRequest.request.body).toEqual({})
  })

  it('isAuth emits proper values on login/logout', () => {
    let testRequest: TestRequest
    const isAuthValues: boolean[] = []
    service.isAuth().subscribe((value: boolean) => {
      isAuthValues.push(value)
    })

    // initial value
    expect(isAuthValues.pop()).toBe(false)

    service.login(CREDS.login, CREDS.password).subscribe()
    testRequest = httpTestingController.expectOne('/api/auth/login')

    testRequest.flush(LOGIN_RETURN)
    expect(isAuthValues.pop()).toBe(true)

    service.logout().subscribe()
    testRequest = httpTestingController.expectOne('/api/auth/logout')

    testRequest.flush(null)
    expect(isAuthValues.pop()).toBe(false)

    expect(isAuthValues.length).toBe(0)
  })

  it('getAuthToken', () => {
    let testRequest: TestRequest

    expect(service.getAuthToken()).toBeNull()

    service.login(CREDS.login, CREDS.password).subscribe()
    testRequest = httpTestingController.expectOne('/api/auth/login')

    testRequest.flush(LOGIN_RETURN)
    expect(service.getAuthToken()).toBe(LOGIN_RETURN.token)

    service.logout().subscribe()
    testRequest = httpTestingController.expectOne('/api/auth/logout')

    testRequest.flush(null)
    expect(service.getAuthToken()).toBeNull()
  })
})

describe('AuthService - creation', () => {
  const AUTH_TOKEN_LOCAL_STORAGE_KEY = 'AuthTokenContractManagement'

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('isAuth initializes to true if local storage has auth token', () => {
    localStorage.setItem(AUTH_TOKEN_LOCAL_STORAGE_KEY, 'token')

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    })
    const service = TestBed.inject(AuthService)
    const isAuthValues: boolean[] = []
    service.isAuth().subscribe((value: boolean) => {
      isAuthValues.push(value)
    })

    // initial value
    expect(isAuthValues.pop()).toBe(true)
  })

  it('isAuth initializes to false if local storage does not have auth token', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    })
    const service = TestBed.inject(AuthService)
    const isAuthValues: boolean[] = []
    service.isAuth().subscribe((value: boolean) => {
      isAuthValues.push(value)
    })

    // initial value
    expect(isAuthValues.pop()).toBe(false)
  })
})
