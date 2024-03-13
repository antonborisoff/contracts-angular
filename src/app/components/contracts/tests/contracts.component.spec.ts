import {
  ContractsComponent
} from '../contracts.component'
import {
  ContractsHarness
} from './contracts.component.harness'
import {
  ContractService
} from '../../../services/contracts/contract.service'
import en from '../i18n/en.json'
import {
  Contract
} from '../../../interfaces/contract'
import {
  of
} from 'rxjs'
import {
  ComponentHarnessAndUtils,
  initComponentBase,
  throwBackendError
} from '../../../tests/utils'
import {
  Utilities
} from '../../../tests/foundation/utilities'

describe('ContractsComponent', () => {
  let contractServiceMock: jasmine.SpyObj<ContractService>
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

  async function initComponent(contracts?: Contract[]): ComponentHarnessAndUtils<ContractsHarness> {
    if (contracts) {
      contractServiceMock.getContracts.and.returnValue(of(contracts))
    }
    else {
      contractServiceMock.getContracts.and.returnValue(throwBackendError())
    }
    return initComponentBase(ContractsComponent, ContractsHarness, en, {
      routePaths: ['contract'],
      providers: [{
        provide: ContractService,
        useValue: contractServiceMock
      }]
    })
  }

  beforeEach(async () => {
    contractServiceMock = jasmine.createSpyObj<ContractService>('contracts', [
      'getContracts',
      'deleteContract'
    ])
  })

  it('display list of contracts', async () => {
    const {
      harnesses
    } = await initComponent(CONTRACTS)

    expect(await harnesses.router.component.matTableNRows('contractList')).toBe(CONTRACTS.length)
    expect(await harnesses.router.component.elementVisible('noContractsMessage')).toBe(false)
    for (const contract of CONTRACTS) {
      expect(await harnesses.router.component.inMatTableRow('contractList', {
        number: contract.number
      }).elementText('contractNumber')).toBe(contract.number)
      expect(await harnesses.router.component.inMatTableRow('contractList', {
        number: contract.number
      }).elementText('contractConditions')).toBe(contract.conditions)
    }
    expect(await harnesses.router.component.elementVisible('noContractsMessage')).toBe(false)
  })

  it('display no contract message if there are no contracts', async () => {
    const {
      harnesses
    } = await initComponent([])

    expect(await harnesses.router.component.matTableNRows('contractList')).toBe(0)
    expect(await harnesses.router.component.elementVisible('noContractsMessage')).toBe(true)
  })

  it('handle backend error during contracts fetch', async () => {
    expect(await Utilities.errorMessageBoxPresent(async () => {
      await initComponent()
    })).toBe(true)
  })

  it('contract delete - success', async () => {
    const {
      harnesses
    } = await initComponent(CONTRACTS)

    const contractToDelete = CONTRACTS[1]
    const expectedContracts = CONTRACTS.filter((contract) => {
      return contract.id !== contractToDelete.id
    })
    contractServiceMock.deleteContract.withArgs(contractToDelete.id).and.returnValue(of(void 0))
    contractServiceMock.getContracts.and.returnValue(of(expectedContracts))

    await Utilities.actOnMessageBox(async () => {
      await harnesses.router.component.inMatTableRow('contractList', {
        number: contractToDelete.number
      }).clickButton('deleteContract')
    }, 'confirm')
    expect(await harnesses.router.component.matTableNRows('contractList')).toBe(expectedContracts.length)
    for (const expectedContract of expectedContracts) {
      expect(await harnesses.router.component.inMatTableRow('contractList', {
        number: expectedContract.number
      }).elementText('contractNumber')).toBe(expectedContract.number)
      expect(await harnesses.router.component.inMatTableRow('contractList', {
        number: expectedContract.number
      }).elementText('contractConditions')).toBe(expectedContract.conditions)
    }
  })

  it('contract delete - cancel', async () => {
    const {
      harnesses
    } = await initComponent(CONTRACTS)

    const contractToDelete = CONTRACTS[1]
    const expectedContracts = CONTRACTS

    await Utilities.actOnMessageBox(async () => {
      await harnesses.router.component.inMatTableRow('contractList', {
        number: contractToDelete.number
      }).clickButton('deleteContract')
    }, 'cancel')
    expect(await harnesses.router.component.matTableNRows('contractList')).toBe(expectedContracts.length)
    for (const expectedContract of expectedContracts) {
      expect(await harnesses.router.component.inMatTableRow('contractList', {
        number: expectedContract.number
      }).elementText('contractNumber')).toBe(expectedContract.number)
      expect(await harnesses.router.component.inMatTableRow('contractList', {
        number: expectedContract.number
      }).elementText('contractConditions')).toBe(expectedContract.conditions)
    }
  })

  it('contract delete - handle backend error', async () => {
    const {
      harnesses
    } = await initComponent(CONTRACTS)

    const contractToDelete = CONTRACTS[1]
    contractServiceMock.deleteContract.withArgs(contractToDelete.id).and.returnValue(throwBackendError())

    expect(await Utilities.errorMessageBoxPresent(async () => {
      await Utilities.actOnMessageBox(async () => {
        await harnesses.router.component.inMatTableRow('contractList', {
          number: contractToDelete.number
        }).clickButton('deleteContract')
      }, 'confirm')
    })).toBe(true)
  })

  it('contract add', async () => {
    const {
      harnesses
    } = await initComponent(CONTRACTS)

    await harnesses.router.component.clickButton('addContractButton')
    expect(Utilities.getLocationPath()).toBe('/contract')
  })

  it('contract edit', async () => {
    const {
      harnesses
    } = await initComponent(CONTRACTS)
    const contractToEdit = CONTRACTS[1]

    await harnesses.router.component.inMatTableRow('contractList', {
      number: contractToEdit.number
    }).clickButton('editContract')
    expect(Utilities.getLocationPath()).toBe(`/contract?contractId=${contractToEdit.id}`)
  })
})
