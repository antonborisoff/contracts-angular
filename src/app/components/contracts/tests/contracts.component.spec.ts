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
    return initComponentBase(ContractsComponent, ContractsHarness, {
      en: en
    }, {
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

    await harnesses.router.component.expectMatTableNRows('contractList', getVisibleContracts(CONTRACTS).length)
    for (const contract of getVisibleContracts(CONTRACTS)) {
      await harnesses.router.component.inMatTableRow('contractList', {
        number: contract.number
      }).expectElementText('contractNumber', contract.number)
      await harnesses.router.component.inMatTableRow('contractList', {
        number: contract.number
      }).expectElementText('contractConditions', contract.conditions)
    }
    await harnesses.router.component.expectElementVisible('noContractsMessage', false)
  })

  it('display no contract message if there are no contracts', async () => {
    const {
      harnesses
    } = await initComponent([])

    await harnesses.router.component.expectMatTableNRows('contractList', 0)
    await harnesses.router.component.expectElementVisible('noContractsMessage', true)
  })

  it('handle backend error during contracts fetch', async () => {
    const {
      harnesses
    } = await initComponent()
    await harnesses.router.component.expectMessageBoxPresent(MessageType.ERROR)
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
    }).clickElement('deleteContract')
    await harnesses.router.component.messageBoxClick(MessageActions.CONFIRM)
    await harnesses.router.component.expectMatTableNRows('contractList', expectedContracts.length)
    for (const expectedContract of expectedContracts) {
      await harnesses.router.component.inMatTableRow('contractList', {
        number: expectedContract.number
      }).expectElementText('contractNumber', expectedContract.number)
      await harnesses.router.component.inMatTableRow('contractList', {
        number: expectedContract.number
      }).expectElementText('contractConditions', expectedContract.conditions)
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
    }).clickElement('deleteContract')
    await harnesses.router.component.messageBoxClick(MessageActions.CANCEL)
    await harnesses.router.component.expectMatTableNRows('contractList', expectedContracts.length)
    for (const expectedContract of expectedContracts) {
      await harnesses.router.component.inMatTableRow('contractList', {
        number: expectedContract.number
      }).expectElementText('contractNumber', expectedContract.number)
      await harnesses.router.component.inMatTableRow('contractList', {
        number: expectedContract.number
      }).expectElementText('contractConditions', expectedContract.conditions)
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
    }).clickElement('deleteContract')
    await harnesses.router.component.messageBoxClick(MessageActions.CONFIRM)
    await harnesses.router.component.expectMessageBoxPresent(MessageType.ERROR)
  })

  it('contract add', async () => {
    const {
      harnesses
    } = await initComponent(CONTRACTS)

    await harnesses.router.component.clickElement('addContractButton')
    expect(Utilities.getLocationPath()).toBe('/contract')
  })

  it('contract edit', async () => {
    const {
      harnesses
    } = await initComponent(CONTRACTS)
    const contractToEdit = CONTRACTS[1]

    await harnesses.router.component.inMatTableRow('contractList', {
      number: contractToEdit.number
    }).clickElement('editContract')
    expect(Utilities.getLocationPath()).toBe(`/contract?contractId=${contractToEdit.id}`)
  })

  it('search contracts', async () => {
    const {
      harnesses
    } = await initComponent(CONTRACTS)
    const contractToFind = CONTRACTS[5]

    await harnesses.router.component.enterValue('contractSearchInput', contractToFind.number)
    await harnesses.router.component.expectMatTableNRows('contractList', 1)
    await harnesses.router.component.inMatTableRow('contractList', {
      number: contractToFind.number
    }).expectElementText('contractNumber', contractToFind.number)
    await harnesses.router.component.inMatTableRow('contractList', {
      number: contractToFind.number
    }).expectElementText('contractConditions', contractToFind.conditions)

    await harnesses.router.component.enterValue('contractSearchInput', '')
    await harnesses.router.component.expectMatTableNRows('contractList', getVisibleContracts(CONTRACTS).length)

    await harnesses.router.component.enterValue('contractSearchInput', 'some nono-existent contract number')
    await harnesses.router.component.expectMatTableNRows('contractList', 0)

    await harnesses.router.component.enterValue('contractSearchInput', '')
    await harnesses.router.component.expectMatTableNRows('contractList', getVisibleContracts(CONTRACTS).length)
  })
})
