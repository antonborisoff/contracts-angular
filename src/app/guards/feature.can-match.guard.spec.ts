import {
  TestBed
} from '@angular/core/testing'
import {
  FeatureToggleService
} from '../services/features/feature-toggle.service'
import {
  featureCanMatchGuard
} from './feature.can-match.guard'
import {
  RouterTestingHarness,
  RouterTestingModule
} from '@angular/router/testing'
import {
  TestComponent
} from '../tests/utils'
import {
  Location
} from '@angular/common'

describe('featureCanMatchGuard', () => {
  let featureToggleServiceMock: jasmine.SpyObj<FeatureToggleService>
  let routerHarness: RouterTestingHarness
  let location: Location

  beforeEach(async () => {
    featureToggleServiceMock = jasmine.createSpyObj<FeatureToggleService>('featureToggleService', ['isActive'])
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{
        path: 'routeAB',
        canMatch: [featureCanMatchGuard([
          'FT_Feature_A',
          'FT_Feature_B'
        ])],
        component: TestComponent
      }])],
      providers: [{
        provide: FeatureToggleService,
        useValue: featureToggleServiceMock
      }]
    }).compileComponents()

    routerHarness = await RouterTestingHarness.create()
    location = TestBed.inject(Location)
  })

  it('both features inactive - cannot match the route', async () => {
    featureToggleServiceMock.isActive.withArgs('FT_Feature_A').and.returnValue(false)
    featureToggleServiceMock.isActive.withArgs('FT_Feature_B').and.returnValue(false)

    await expectAsync(routerHarness.navigateByUrl('/routeAB')).toBeRejected()
  })

  it('feature A active, feature B inactive - cannot match the route', async () => {
    featureToggleServiceMock.isActive.withArgs('FT_Feature_A').and.returnValue(true)
    featureToggleServiceMock.isActive.withArgs('FT_Feature_B').and.returnValue(false)

    await expectAsync(routerHarness.navigateByUrl('/routeAB')).toBeRejected()
  })

  it('feature A active, feature B active - can match the route', async () => {
    featureToggleServiceMock.isActive.withArgs('FT_Feature_A').and.returnValue(true)
    featureToggleServiceMock.isActive.withArgs('FT_Feature_B').and.returnValue(true)

    await routerHarness.navigateByUrl('/routeAB')
    expect(location.path()).toBe('/routeAB')
  })
})
