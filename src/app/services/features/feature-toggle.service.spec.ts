import {
  TestBed
} from '@angular/core/testing'

import {
  FeatureToggleService
} from './feature-toggle.service'

describe('FeatureToggleService', () => {
  let service: FeatureToggleService

  beforeEach(() => {
    localStorage.clear()
    TestBed.configureTestingModule({
      imports: []
    })
    service = TestBed.inject(FeatureToggleService)
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('init + isActive', () => {
    const activeFeature = 'FT_Test_Feature'

    expect(service.isActive(activeFeature)).toBe(false)

    service.init([activeFeature])
    expect(service.isActive(activeFeature)).toBe(true)
  })

  it('init - could not init after init, active features stay the same', () => {
    service.init(['FT_A'])
    expect(service.isActive('FT_A')).toBe(true)
    expect(service.isActive('FT_B')).toBe(false)

    service.init(['FT_B'])
    expect(service.isActive('FT_A')).toBe(true)
    expect(service.isActive('FT_B')).toBe(false)
  })

  it('cleanup + isActive', () => {
    service.init(['FT_A'])
    expect(service.isActive('FT_A')).toBe(true)

    service.cleanup()
    expect(service.isActive('FT_A')).toBe(false)
  })

  it('cleanup - could init after cleanup', () => {
    service.init(['FT_A'])
    expect(service.isActive('FT_A')).toBe(true)
    expect(service.isActive('FT_B')).toBe(false)

    service.cleanup()
    service.init(['FT_B'])
    expect(service.isActive('FT_A')).toBe(false)
    expect(service.isActive('FT_B')).toBe(true)
  })

  it('isActive and throw if inactive', () => {
    const isActiveSpy = spyOn<FeatureToggleService, 'isActive'>(service, 'isActive')
    isActiveSpy.withArgs('FT_A').and.returnValue(false)
    isActiveSpy.withArgs('FT_B').and.returnValue(true)

    expect(() => {
      service.throwIfInactive('FT_A')
    }).toThrowError('feature inactive')

    expect(() => {
      service.throwIfInactive('FT_B')
    }).not.toThrow()
  })
})

describe('FeatureToggleService - creation', () => {
  const ACTIVE_FEATURES_LOCAL_STORAGE_KEY = 'activeFeaturesContractsManagement'

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('service is initialized if local storage has active features', () => {
    localStorage.setItem(ACTIVE_FEATURES_LOCAL_STORAGE_KEY, JSON.stringify(['FT_Active_A']))

    TestBed.configureTestingModule({
      imports: []
    })
    const service = TestBed.inject(FeatureToggleService)

    expect(service.isActive('FT_Active_A')).toBe(true)

    service.init(['FT_Active_B'])
    expect(service.isActive('FT_Active_A')).toBe(true)
    expect(service.isActive('FT_Active_B')).toBe(false)
  })

  it('service is not initialized if local storage does not have active features', () => {
    TestBed.configureTestingModule({
      imports: []
    })
    const service = TestBed.inject(FeatureToggleService)

    expect(service.isActive('FT_Active_A')).toBe(false)

    service.init(['FT_Active_B'])
    expect(service.isActive('FT_Active_A')).toBe(false)
    expect(service.isActive('FT_Active_B')).toBe(true)
  })
})
