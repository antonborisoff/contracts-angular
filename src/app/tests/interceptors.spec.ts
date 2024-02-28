import {
  TestBed
} from '@angular/core/testing'
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing'
import {
  HttpClient,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http'
import {
  authInterceptor
} from '../interceptors'
import {
  AuthService
} from '../services/auth/auth.service'

describe('Interceptors', () => {
  let httpTestingController: HttpTestingController
  let httpClient: HttpClient
  const AUTH_TOKEN = 'token'

  beforeEach(() => {
    const authServiceMock = jasmine.createSpyObj<AuthService>('authService', ['getAuthToken'])
    authServiceMock.getAuthToken.and.returnValue(AUTH_TOKEN)
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock
        },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    })
    httpTestingController = TestBed.inject(HttpTestingController)
    httpClient = TestBed.inject(HttpClient)
  })

  afterEach(() => {
    httpTestingController.verify()
  })

  it('auth interceptor adds auth headers', () => {
    const url = '/mockendpoint'

    httpClient.get(url).subscribe()
    const testRequest = httpTestingController.expectOne(url)

    expect(testRequest.request.headers.get('Auth-token')).toBe(AUTH_TOKEN)
  })
})
