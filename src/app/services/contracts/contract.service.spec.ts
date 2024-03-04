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

describe('ContractService', () => {
  let service: ContractService
  let httpTestingController: HttpTestingController
  const endpointPath = '/api/contracts'

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    })
    service = TestBed.inject(ContractService)
    httpTestingController = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpTestingController.verify()
  })

  it('getContracts dispatches request properly and returns expected data', () => {
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

  it('deleteContract dispatches request properly', () => {
    const contractId = 'some_contract_id'

    service.deleteContract(contractId).subscribe()
    const testRequest = httpTestingController.expectOne(`${endpointPath}/${contractId}`)
    expect(testRequest.request.method).toBe('DELETE')
  })
})
