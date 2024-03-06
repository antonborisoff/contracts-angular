import {
  TestBed
} from '@angular/core/testing'

import {
  HomeComponent
} from '../home.component'
import {
  HomeHarness
} from './home.component.harness'
import {
  getTranslocoTestingModule
} from '../../../../transloco/transloco-testing'
import en from '../i18n/en.json'
import {
  TestbedHarnessEnvironment
} from '@angular/cdk/testing/testbed'
import {
  FeatureToggleService
} from '../../../services/features/feature-toggle.service'
import {
  RouterTestingModule
} from '@angular/router/testing'
import {
  Location
} from '@angular/common'
import {
  TestComponent
} from '../../../tests/utils'

describe('HomeComponent', () => {
  let featureToggleServiceMock: jasmine.SpyObj<FeatureToggleService>

  async function initComponent(): Promise<{
    homeHarness: HomeHarness
  }> {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        getTranslocoTestingModule(HomeComponent, en),
        RouterTestingModule.withRoutes([{
          path: 'contracts',
          component: TestComponent
        }])
      ],
      providers: [{
        provide: FeatureToggleService,
        useValue: featureToggleServiceMock
      }]
    }).compileComponents()

    const fixture = TestBed.createComponent(HomeComponent)
    const homeHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, HomeHarness)
    return {
      homeHarness
    }
  }

  beforeEach(() => {
    featureToggleServiceMock = jasmine.createSpyObj<FeatureToggleService>('featureToggleService', ['isActive'])
  })

  it('display welcome message', async () => {
    const {
      homeHarness
    } = await initComponent()

    expect(await homeHarness.elementVisible('welcomeMessage')).toBe(true)
  })

  it('FT_Contracts ON - show link to contracts', async () => {
    featureToggleServiceMock.isActive.withArgs('FT_Contracts').and.returnValue(true)
    const {
      homeHarness
    } = await initComponent()

    expect(await homeHarness.elementVisible('navToContractsLink')).toBe(true)
  })

  it('FT_Contracts ON - navigate to home page on link click', async () => {
    featureToggleServiceMock.isActive.withArgs('FT_Contracts').and.returnValue(true)
    const {
      homeHarness
    } = await initComponent()

    await homeHarness.clickLink('navToContractsLink')
    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/contracts')
  })

  it('FT_Contracts OFF - hide link to contracts', async () => {
    featureToggleServiceMock.isActive.withArgs('FT_Contracts').and.returnValue(false)
    const {
      homeHarness
    } = await initComponent()

    expect(await homeHarness.elementVisible('navToContractsLink')).toBe(false)
  })
})
