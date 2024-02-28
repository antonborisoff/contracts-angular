import {
  TestBed
} from '@angular/core/testing'

import {
  FeatureToggleService
} from './feature-toggle.service'

describe('FeatureToggleService', () => {
  let service: FeatureToggleService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: []
    })
    service = TestBed.inject(FeatureToggleService)
  })

  it('init service - can do only once', () => {
    expect(() => {
      service.init(['FT_A'])
    }).not.toThrow()
    expect(() => {
      service.init(['FT_B'])
    }).toThrowError('Feature toggle service initialization already completed.')
  })

  it('isActive - uses features the service was initialized with', () => {
    const activeFeature = 'FT_Test_Feature'

    expect(service.isActive(activeFeature)).toBe(false)

    service.init([activeFeature])
    expect(service.isActive(activeFeature)).toBe(true)
  })

  it('init service - active features do not change after init', () => {
    service.init(['FT_A'])
    expect(service.isActive('FT_A')).toBe(true)
    expect(service.isActive('FT_B')).toBe(false)

    expect(() => {
      service.init(['FT_B'])
    }).toThrow()
    expect(service.isActive('FT_A')).toBe(true)
    expect(service.isActive('FT_B')).toBe(false)
  })
})
