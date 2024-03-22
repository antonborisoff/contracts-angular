import {
  HomeComponent
} from '../home.component'
import {
  HomeHarness
} from './home.component.harness'
import en from '../i18n/en.json'
import {
  FeatureToggleService
} from '../../../services/features/feature-toggle.service'
import {
  ComponentHarnessAndUtils,
  initComponentBase
} from '../../../tests/utils'
import {
  Utilities
} from '../../../tests/foundation/utilities'

describe('HomeComponent', () => {
  let featureToggleServiceMock: jasmine.SpyObj<FeatureToggleService>

  async function initComponent(): ComponentHarnessAndUtils<HomeHarness> {
    return initComponentBase(HomeComponent, HomeHarness, {
      en: en
    }, {
      routePaths: ['contracts'],
      providers: [{
        provide: FeatureToggleService,
        useValue: featureToggleServiceMock
      }]
    })
  }

  beforeEach(() => {
    featureToggleServiceMock = jasmine.createSpyObj<FeatureToggleService>('featureToggleService', ['isActive'])
  })

  it('FT_Contracts ON - show link to contracts', async () => {
    featureToggleServiceMock.isActive.withArgs('FT_Contracts').and.returnValue(true)
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.component.expectElementVisible('navToContractsLink', true)
  })

  it('FT_Contracts ON - navigate to home page on link click', async () => {
    featureToggleServiceMock.isActive.withArgs('FT_Contracts').and.returnValue(true)
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.component.clickElement('navToContractsLink')
    expect(Utilities.getLocationPath()).toBe('/contracts')
  })

  it('FT_Contracts OFF - hide link to contracts', async () => {
    featureToggleServiceMock.isActive.withArgs('FT_Contracts').and.returnValue(false)
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.component.expectElementVisible('navToContractsLink', false)
  })
})
