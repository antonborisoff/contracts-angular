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

describe('AuthService', () => {
  let service: AuthService
  let httpTestingController: HttpTestingController
  const CREDS = {
    login: 'my_login',
    password: 'my_password'
  }
  const TOKEN_RES = {
    token: 'token'
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    })
    httpTestingController = TestBed.inject(HttpTestingController)
    service = TestBed.inject(AuthService)
  })

  afterEach(() => {
    httpTestingController.verify()
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

  it('logout dispatches request properly', () => {
    service.logout().subscribe()
    const testRequest = httpTestingController.expectOne('/api/auth/logout')

    expect(testRequest.request.method).toBe('POST')
    expect(testRequest.request.body).toEqual({})
  })

  it('isAuth emits proper values on login/logout', () => {
    let testRequest: TestRequest
    const isAuthValues: boolean[] = []
    const isAuth$ = service.isAuth()
    isAuth$.subscribe((value: boolean) => {
      isAuthValues.push(value)
    })

    // initial value
    expect(isAuthValues.pop()).toBe(false)

    service.login(CREDS.login, CREDS.password).subscribe()
    testRequest = httpTestingController.expectOne('/api/auth/login')
    testRequest.flush(TOKEN_RES)
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
    testRequest.flush(TOKEN_RES)
    expect(service.getAuthToken()).toBe(TOKEN_RES.token)

    service.logout().subscribe()
    testRequest = httpTestingController.expectOne('/api/auth/logout')
    testRequest.flush(null)
    expect(service.getAuthToken()).toBeNull()
  })
})
