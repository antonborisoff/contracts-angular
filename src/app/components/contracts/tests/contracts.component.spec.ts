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
import {
  MessageActions,
  MessageType
} from '../../../services/message-box/interfaces'

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
    },
    {
      id: 'test_c',
      number: 'TESTC',
      conditions: 'test contract c'
    },
    {
      id: 'test_d',
      number: 'TESTD',
      conditions: 'test contract d'
    },
    {
      id: 'test_e',
      number: 'TESTE',
      conditions: 'test contract e'
    },
    {
      id: 'test_f',
      number: 'TESTF',
      conditions: 'test contract f'
    }
  ]
  function getVisibleContracts(contracts: Contract[]): Contract[] {
    return contracts.slice(0, 5)
  }

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

    expect(await harnesses.router.component.matTableNRows('contractList')).toBe(getVisibleContracts(CONTRACTS).length)
    expect(await harnesses.router.component.elementVisible('noContractsMessage')).toBe(false)
    for (const contract of getVisibleContracts(CONTRACTS)) {
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
    const {
      harnesses
    } = await initComponent()
    await expectAsync(harnesses.messageBox.present(MessageType.ERROR)).toBeResolvedTo(true)
  })

  it('contract delete - success', async () => {
    const {
      harnesses
    } = await initComponent(CONTRACTS)

    const contractToDelete = CONTRACTS[1]
    const expectedContracts = getVisibleContracts(CONTRACTS.filter((contract) => {
      return contract.id !== contractToDelete.id
    }))
    contractServiceMock.deleteContract.withArgs(contractToDelete.id).and.returnValue(of(void 0))
    contractServiceMock.getContracts.and.returnValue(of(expectedContracts))

    await harnesses.router.component.inMatTableRow('contractList', {
      number: contractToDelete.number
    }).clickButton('deleteContract')
    await harnesses.messageBox.act(MessageActions.CONFIRM)
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
    const expectedContracts = getVisibleContracts(CONTRACTS)

    await harnesses.router.component.inMatTableRow('contractList', {
      number: contractToDelete.number
    }).clickButton('deleteContract')
    await harnesses.messageBox.act(MessageActions.CANCEL)
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

    await harnesses.router.component.inMatTableRow('contractList', {
      number: contractToDelete.number
    }).clickButton('deleteContract')
    await harnesses.messageBox.act(MessageActions.CONFIRM)
    await expectAsync(harnesses.messageBox.present(MessageType.ERROR)).toBeResolvedTo(true)
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
