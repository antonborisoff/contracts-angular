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
  let service: ContractService
  let httpTestingController: HttpTestingController
  const endpointPath = '/api/contracts'

  beforeEach(() => {
    featureToggleServiceMock = jasmine.createSpyObj<FeatureToggleService>('featureToggleService', ['throwIfInactive'])
    featureToggleServiceMock.throwIfInactive.withArgs('FT_Contracts').and.returnValue()
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{
        provide: FeatureToggleService,
        useValue: featureToggleServiceMock
      }]
    })
    service = TestBed.inject(ContractService)
    httpTestingController = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpTestingController.verify()
  })

  it('FT_Contracts ON - getContracts dispatches request properly and returns expected data', () => {
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
  })

  it('FT_Contracts ON - getContract dispatches request properly and returns expected data', () => {
    const expectedContract: Contract = {
      id: 'test_a',
      number: 'testA',
      conditions: 'test a'
    }
    let actualContract: Contract | undefined

    service.getContract(expectedContract.id).subscribe((contract) => {
      actualContract = contract
    })
    const testRequest = httpTestingController.expectOne(`${endpointPath}/${expectedContract.id}`)
    expect(testRequest.request.method).toBe('GET')

    testRequest.flush(expectedContract)
    expect(actualContract).toEqual(jasmine.objectContaining(expectedContract))
  })

  it('FT_Contracts ON - deleteContract dispatches request properly', () => {
    const contractId = 'some_contract_id'

    service.deleteContract(contractId).subscribe()
    const testRequest = httpTestingController.expectOne(`${endpointPath}/${contractId}`)
    expect(testRequest.request.method).toBe('DELETE')
  })

  it('FT_Contracts ON - createContract dispatches request properly', () => {
    const contractToCreate = {
      number: 'APX_300',
      conditions: '3 year labour contract'
    }
    const contractId = 'some_contract_id'
    let contractIdCreated: string = ''

    service.createContract(contractToCreate).subscribe(id => contractIdCreated = id)
    const testRequest = httpTestingController.expectOne(`${endpointPath}`)
    expect(testRequest.request.method).toBe('POST')
    expect(testRequest.request.body).toEqual(jasmine.objectContaining(contractToCreate))

    testRequest.flush({
      id: contractId
    })
    expect(contractIdCreated).toBe(contractId)
  })

  it('FT_Contracts ON - updateContract dispatches request properly', () => {
    const updatedContract = {
      number: 'APX_300_AB',
      conditions: '3 year labour contract (edited)'
    }
    const contractId = 'some_contract_id'

    service.updateContract(contractId, updatedContract).subscribe()
    const testRequest = httpTestingController.expectOne(`${endpointPath}/${contractId}`)
    expect(testRequest.request.method).toBe('PUT')
    expect(testRequest.request.body).toEqual(jasmine.objectContaining(updatedContract))
  })

  it('FT_Contracts OFF - all methods throw error', () => {
    const errorMessage = 'Feature inactive'
    featureToggleServiceMock.throwIfInactive.withArgs('FT_Contracts').and.throwError(errorMessage)

    expect(() => {
      service.getContracts()
    }).toThrowError(errorMessage)

    expect(() => {
      service.getContract('some_contract_id')
    }).toThrowError(errorMessage)

    expect(() => {
      service.deleteContract('some_contract_id')
    }).toThrowError(errorMessage)

    expect(() => {
      service.createContract({
        number: 'some number',
        conditions: 'some conditionss'
      })
    }).toThrowError(errorMessage)

    expect(() => {
      service.updateContract('some_contract_id', {
        number: 'some number',
        conditions: 'some conditionss'
      })
    }).toThrowError(errorMessage)
  })
})
