import {
  ComponentFixtureAutoDetect,
  TestBed
} from '@angular/core/testing'
import {
  AppComponent
} from './app.component'
import {
  TranslateTestingModule
} from 'ngx-translate-testing'
import en from '../assets/i18n/en.json'

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        TranslateTestingModule
          .withTranslations('en', en)
          .withDefaultLanguage('en')
      ],
      providers: [{
        provide: ComponentFixtureAutoDetect,
        useValue: true
      }]
    }).compileComponents()
  })

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.componentInstance
    expect(app).toBeTruthy()
  })

  it(`should have the 'contracts-angular' title`, () => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.componentInstance
    expect(app.title).toEqual('contracts-angular')
  })

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent)
    const compiled = fixture.nativeElement as HTMLElement
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, contracts-angular')
  })
})
