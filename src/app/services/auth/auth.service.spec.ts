import {
  TestBed
} from '@angular/core/testing'
import {
  HttpClientTestingModule,
  HttpTestingController
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

  it('should properly execute request for login', () => {
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

    testRequest.flush(null)
    httpTestingController.verify()
  })

  it('should properly execute request for logout', () => {
    service.logout().subscribe()
    const testRequest = httpTestingController.expectOne('/api/auth/logout')

    expect(testRequest.request.method).toBe('POST')
    expect(testRequest.request.body).toEqual({})

    testRequest.flush(null)
    httpTestingController.verify()
  })
})
