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
    const creds = {
      login: 'my_login',
      password: 'my_password'
    }

    service.login(creds.login, creds.password).subscribe()
    const testRequest = httpTestingController.expectOne('/api/auth/login')

    expect(testRequest.request.method).toBe('POST')
    expect(testRequest.request.body).toEqual(jasmine.objectContaining({
      login: creds.login,
      password: creds.password
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
    const creds = {
      login: 'my_login',
      password: 'my_password'
    }
    const isAuthValues: boolean[] = []
    const isAuth$ = service.isAuth()
    isAuth$.subscribe((value: boolean) => {
      isAuthValues.push(value)
    })

    // initial value
    expect(isAuthValues.pop()).toBe(false)

    service.login(creds.login, creds.password).subscribe()
    testRequest = httpTestingController.expectOne('/api/auth/login')
    testRequest.flush(null)
    expect(isAuthValues.pop()).toBe(true)

    service.logout().subscribe()
    testRequest = httpTestingController.expectOne('/api/auth/logout')
    testRequest.flush(null)
    expect(isAuthValues.pop()).toBe(false)

    expect(isAuthValues.length).toBe(0)
  })
})
