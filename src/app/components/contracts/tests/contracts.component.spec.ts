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
  MessageBoxService
} from '../../../services/message-box/message-box.service'

describe('ContractsComponent', () => {
  let contractServiceMock: jasmine.SpyObj<ContractService>
  let messageBoxServiceMock: jasmine.SpyObj<MessageBoxService>
  let contractsHarness: ContractsHarness

  async function initComponent(contracts?: Contract[]): Promise<ContractsHarness> {
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
          provide: MessageBoxService,
          useValue: messageBoxServiceMock
        }
      ]
    }).compileComponents()

    const fixture = TestBed.createComponent(ContractsComponent)
    contractsHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ContractsHarness)
    return contractsHarness
  }

  beforeEach(async () => {
    contractServiceMock = jasmine.createSpyObj<ContractService>('contracts', ['getContracts'])
    messageBoxServiceMock = jasmine.createSpyObj<MessageBoxService>('messageBoxService', ['error'])
  })

  it('display list of contracts', async () => {
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
    await initComponent(CONTRACTS)

    expect(await contractsHarness.elementChildCount('contractList')).toBe(CONTRACTS.length)
    expect(await contractsHarness.elementVisible('noContractsMessage')).toBe(false)
    for (const contract of CONTRACTS) {
      expect(await contractsHarness.inElement(`contract-${contract.id}`).elementText('contractNumber')).toBe(contract.number)
      expect(await contractsHarness.inElement(`contract-${contract.id}`).elementText('contractConditions')).toBe(contract.conditions)
    }
  })

  it('display no contract message if there are no contracts', async () => {
    await initComponent([])

    expect(await contractsHarness.elementChildCount('contractList')).toBe(0)
    expect(await contractsHarness.elementVisible('noContractsMessage')).toBe(true)
  })

  it('display translated general error if something goes wrong during contract fetch', async () => {
    await initComponent()

    expect(messageBoxServiceMock.error).toHaveBeenCalledWith('Something went wrong.')
  })
})
