import {
  TestBed
} from '@angular/core/testing'

import {
  ContractService
} from './contract.service'
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing'
import {
  Contract
} from '../../interfaces/contract'
import {
  FeatureToggleService
} from '../features/feature-toggle.service'

describe('ContractService', () => {
  let featureToggleServiceMock: jasmine.SpyObj<FeatureToggleService>
  const endpointPath = '/api/contracts'

  function initService(): {
    service: ContractService
    httpTestingController: HttpTestingController
  } {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{
        provide: FeatureToggleService,
        useValue: featureToggleServiceMock
      }]
    })
    const service = TestBed.inject(ContractService)
    const httpTestingController = TestBed.inject(HttpTestingController)
    return {
      service,
      httpTestingController
    }
  }

  beforeEach(() => {
    featureToggleServiceMock = jasmine.createSpyObj<FeatureToggleService>('featureToggleService', ['isActive'])
    featureToggleServiceMock.isActive.withArgs('FT_Contracts').and.returnValue(true)
  })

  it('service cannot be used when feature is inactive', () => {
    featureToggleServiceMock.isActive.withArgs('FT_Contracts').and.returnValue(false)

    expect(() => {
      initService()
    }).toThrowError('Feature is inactive')
  })

  it('getContracts dispatches request properly and returns expected data', () => {
    const {
      service, httpTestingController
    } = initService()

    const expectedContracts: Contract[] = [
      {
        id: 'test_a',
        number: 'testA',
        conditions: 'test a'
      },
      {
        id: 'test_b',
        number: 'testB',
        conditions: 'test b'
      }
    ]
    let actualContracts: Contract[] = []

    service.getContracts().subscribe((contracts) => {
      actualContracts = contracts
    })
    const testRequest = httpTestingController.expectOne(endpointPath)
    expect(testRequest.request.method).toBe('GET')

    testRequest.flush(expectedContracts)
    expect(actualContracts.length).toBe(expectedContracts.length)
    expectedContracts.forEach((expectedContract) => {
      expect(actualContracts).toContain(jasmine.objectContaining(expectedContract))
    })
    httpTestingController.verify()
  })

  it('deleteContract dispatches request properly', () => {
    const {
      service, httpTestingController
    } = initService()
    const contractId = 'some_contract_id'

    service.deleteContract(contractId).subscribe()
    const testRequest = httpTestingController.expectOne(`${endpointPath}/${contractId}`)
    expect(testRequest.request.method).toBe('DELETE')
    httpTestingController.verify()
  })
})
