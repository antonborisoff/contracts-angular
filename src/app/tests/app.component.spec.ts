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
  of
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

describe('AppComponent', () => {
  let appHarness: AppHarness
  let router: Router

  beforeEach(async () => {
    const authServiceMock = jasmine.createSpyObj<AuthService>('authService', ['logout'])
    authServiceMock.logout.and.callFake(() => {
      return of(undefined)
    })
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        getTranslocoTestingModule(AppComponent, en),
        RouterTestingModule.withRoutes([])
      ],
      providers: [{
        provide: AuthService,
        useValue: authServiceMock
      }]
    }).compileComponents()

    const fixture = TestBed.createComponent(AppComponent)
    appHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, AppHarness)
    router = TestBed.inject(Router)
  })

  it('should display translated welcome message', async () => {
    expect(await appHarness.controlText('welcomeMessage')).toBe('Hello, contracts-angular component en')
  })

  it('should navigate to login on successful logout', async () => {
    const navigateSpy = spyOn<Router, 'navigate'>(router, 'navigate')

    await appHarness.clickButton('logoutButton')
    expect(navigateSpy).toHaveBeenCalledWith(['/login'])
  })
})
