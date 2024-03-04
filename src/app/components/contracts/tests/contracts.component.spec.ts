import {
  TestBed
} from '@angular/core/testing'

import {
  ContractsComponent
} from '../contracts.component'
import {
  getTranslocoTestingModule
} from '../../../../transloco/transloco-testing'
import en from '../i18n/en.json'
import {
  ContractService
} from '../../../services/contracts/contract.service'
import {
  Contract
} from '../../../interfaces/contract'
import {
  of,
  throwError
} from 'rxjs'
import {
  TestbedHarnessEnvironment
} from '@angular/cdk/testing/testbed'
import {
  ContractsHarness
} from './contracts.component.harness'
import {
  BackendErrorHandlerService
} from '../../../services/backend-error-handler/backend-error-handler.service'

describe('ContractsComponent', () => {
  let contractServiceMock: jasmine.SpyObj<ContractService>
  let backendErrorHandlerServiceMock: jasmine.SpyObj<BackendErrorHandlerService>
  const CONTRACTS: Contract[] = [
    {
      id: 'test_a',
      number: 'TESTA',
      conditions: 'test contract a'
    },
    {
      id: 'test_b',
      number: 'TESTB',
      conditions: 'test contract b'
    }
  ]

  async function initComponent(contracts?: Contract[]): Promise<{
    contractsHarness: ContractsHarness
  }> {
    if (contracts) {
      contractServiceMock.getContracts.and.returnValue(of(contracts))
    }
    else {
      contractServiceMock.getContracts.and.callFake(() => {
        return throwError(() => new Error())
      })
    }

    await TestBed.configureTestingModule({
      imports: [
        ContractsComponent,
        getTranslocoTestingModule(ContractsComponent, en)
      ],
      providers: [
        {
          provide: ContractService,
          useValue: contractServiceMock
        },
        {
          provide: BackendErrorHandlerService,
          useValue: backendErrorHandlerServiceMock
        }
      ]
    }).compileComponents()

    const fixture = TestBed.createComponent(ContractsComponent)
    const contractsHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ContractsHarness)
    return {
      contractsHarness
    }
  }

  beforeEach(async () => {
    contractServiceMock = jasmine.createSpyObj<ContractService>('contracts', [
      'getContracts',
      'deleteContract'
    ])
    backendErrorHandlerServiceMock = jasmine.createSpyObj<BackendErrorHandlerService>('backendErrorHandler', ['handleError'])
  })

  it('display list of contracts', async () => {
    const {
      contractsHarness
    } = await initComponent(CONTRACTS)

    expect(await contractsHarness.elementChildCount('contractList')).toBe(CONTRACTS.length)
    expect(await contractsHarness.elementVisible('noContractsMessage')).toBe(false)
    for (const contract of CONTRACTS) {
      expect(await contractsHarness.inElement(`contract-${contract.id}`).elementText('contractNumber')).toBe(contract.number)
      expect(await contractsHarness.inElement(`contract-${contract.id}`).elementText('contractConditions')).toBe(contract.conditions)
    }
  })

  it('display no contract message if there are no contracts', async () => {
    const {
      contractsHarness: contractsHarness
    } = await initComponent([])

    expect(await contractsHarness.elementChildCount('contractList')).toBe(0)
    expect(await contractsHarness.elementVisible('noContractsMessage')).toBe(true)
  })

  it('handle backend error during contracts fetch', async () => {
    await initComponent()

    expect(backendErrorHandlerServiceMock.handleError).toHaveBeenCalledWith()
  })

  it('contract delete - success', async () => {
    const {
      contractsHarness
    } = await initComponent(CONTRACTS)

    const contractToDelete = CONTRACTS[1]
    const expectedContracts = CONTRACTS.filter((contract) => {
      return contract.id !== contractToDelete.id
    })
    contractServiceMock.deleteContract.withArgs(contractToDelete.id).and.returnValue(of(void 0))
    contractServiceMock.getContracts.and.returnValue(of(expectedContracts))

    await contractsHarness.inElement(`contract-${contractToDelete.id}`).clickButton('deleteContract')
    expect(await contractsHarness.elementChildCount('contractList')).toBe(expectedContracts.length)
    for (const expectedContract of expectedContracts) {
      expect(await contractsHarness.inElement(`contract-${expectedContract.id}`).elementText('contractNumber')).toBe(expectedContract.number)
      expect(await contractsHarness.inElement(`contract-${expectedContract.id}`).elementText('contractConditions')).toBe(expectedContract.conditions)
    }
  })

  it('contract delete - handle backend error', async () => {
    const {
      contractsHarness
    } = await initComponent(CONTRACTS)

    const contractToDelete = CONTRACTS[1]
    contractServiceMock.deleteContract.withArgs(contractToDelete.id).and.returnValue(throwError(() => {
      return new Error('some error')
    }))

    await contractsHarness.inElement(`contract-${contractToDelete.id}`).clickButton('deleteContract')
    expect(backendErrorHandlerServiceMock.handleError).toHaveBeenCalledWith()
  })
})
