import en from '../i18n/en.json'
import {
  ContractComponent
} from '../contract.component'
import {
  ContractHarness
} from './contract.component.harness'
import {
  ContractService
} from '../../../services/contracts/contract.service'
import {
  of
} from 'rxjs'
import {
  Contract
} from '../../../interfaces/contract'
import {
  Utilities
} from '../../../tests/foundation/utilities'
import {
  ComponentHarnessAndUtils,
  initComponentBase,
  throwBackendError
} from '../../../tests/utils'
import {
  MessageType
} from '../../../services/message-box/interfaces'

describe('ContractComponent', () => {
  let contractServiceMock: jasmine.SpyObj<ContractService>
  const existingContract: Contract = {
    id: 'some_contract_id',
    number: 'APX1000',
    conditions: '1 year labout contract'
  }
  const anotherExistingContract: Contract = {
    id: 'some_contract_id_2',
    number: 'APX2000',
    conditions: '2 year labout contract'
  }

  async function initComponent(contractId: string | void): ComponentHarnessAndUtils<ContractHarness> {
    return initComponentBase(ContractComponent, ContractHarness, {
      en: en
    }, {
      routePaths: ['contract'],
      navigateAfterInitializationTo: contractId ? `/contract?contractId=${contractId}` : '/contract',
      providers: [{
        provide: ContractService,
        useValue: contractServiceMock
      }]
    })
  }

  beforeEach(() => {
    contractServiceMock = jasmine.createSpyObj<ContractService>('contractService', [
      'createContract',
      'updateContract',
      'getContract'
    ])
    const contracts = [
      existingContract,
      anotherExistingContract
    ]
    contracts.forEach((contract) => {
      contractServiceMock.getContract.withArgs(contract.id).and.returnValue(of(contract))
    })
  })

  it('common - enable/disable create button based on form validity', async () => {
    const {
      harnesses
    } = await initComponent()

    // initial state
    // invalid form: number missing, conditions missing
    await harnesses.router.component.expectButtonEnabled('saveContractButton', false)

    // invalid form: number present, conditions missing
    await harnesses.router.component.enterValue('numberInput', 'APX3000')
    await harnesses.router.component.expectButtonEnabled('saveContractButton', false)

    // valid form: number present, conditions present
    await harnesses.router.component.enterValue('conditionsInput', '3 year labour contract')
    await harnesses.router.component.expectButtonEnabled('saveContractButton', true)

    // valid form: number present, conditions missing
    await harnesses.router.component.enterValue('conditionsInput', '')
    await harnesses.router.component.expectButtonEnabled('saveContractButton', false)

    // valid form: number present, conditions missing (whitespaces are ignored for conditions)
    await harnesses.router.component.enterValue('conditionsInput', ' ')
    await harnesses.router.component.expectButtonEnabled('saveContractButton', false)

    // invalid form: number missing, conditions present
    await harnesses.router.component.enterValue('conditionsInput', '3 year labour contract')
    await harnesses.router.component.enterValue('numberInput', '')
    await harnesses.router.component.expectButtonEnabled('saveContractButton', false)

    // invalid form: number missing, conditions present (whitespaces are ignored for number)
    await harnesses.router.component.enterValue('numberInput', ' ')
    await harnesses.router.component.expectButtonEnabled('saveContractButton', false)
  })

  it('common - display/hide error message based on number validity', async () => {
    const {
      harnesses
    } = await initComponent()

    // initial state: no validation done
    await harnesses.router.component.expectElementVisible('numberErrorEmpty', false)

    // validation is not triggered until blur
    await harnesses.router.component.enterValue('numberInput', '', false)
    await harnesses.router.component.expectElementVisible('numberErrorEmpty', false)

    await harnesses.router.component.enterValue('numberInput', '')
    await harnesses.router.component.expectElementVisible('numberErrorEmpty', true)

    await harnesses.router.component.enterValue('numberInput', 'APX3000')
    await harnesses.router.component.expectElementVisible('numberErrorEmpty', false)

    // whitespaces are ignored
    await harnesses.router.component.enterValue('numberInput', ' ')
    await harnesses.router.component.expectElementVisible('numberErrorEmpty', true)
  })

  it('common - display/hide error message based on conditions validity', async () => {
    const {
      harnesses
    } = await initComponent()

    // initial state: no validation done
    await harnesses.router.component.expectElementVisible('conditionsErrorEmpty', false)

    // validation is not triggered until blur
    await harnesses.router.component.enterValue('conditionsInput', '', false)
    await harnesses.router.component.expectElementVisible('conditionsErrorEmpty', false)

    await harnesses.router.component.enterValue('conditionsInput', '')
    await harnesses.router.component.expectElementVisible('conditionsErrorEmpty', true)

    await harnesses.router.component.enterValue('conditionsInput', '3 year labour contract')
    await harnesses.router.component.expectElementVisible('conditionsErrorEmpty', false)

    // whitespaces are ignored
    await harnesses.router.component.enterValue('conditionsInput', ' ')
    await harnesses.router.component.expectElementVisible('conditionsErrorEmpty', true)
  })

  it('add - navigate back on success', async () => {
    contractServiceMock.createContract.and.returnValue(of('new_contract_id'))
    const {
      harnesses
    } = await initComponent()
    const contractToCreate = {
      number: 'APX3000',
      conditions: '3 year labour contract'
    }

    await harnesses.router.component.enterValue('numberInput', contractToCreate.number)
    await harnesses.router.component.enterValue('conditionsInput', contractToCreate.conditions)
    await harnesses.router.component.clickElement('saveContractButton')
    expect(contractServiceMock.createContract).toHaveBeenCalledWith(jasmine.objectContaining(contractToCreate))
    expect(Utilities.getLocationPath()).toBe('/initial')
  })

  it('add - handle backend error', async () => {
    contractServiceMock.createContract.and.returnValue(throwBackendError())
    const {
      harnesses
    } = await initComponent()
    const contractToCreate = {
      number: 'APX3000',
      conditions: '3 year labour contract'
    }

    await harnesses.router.component.enterValue('numberInput', contractToCreate.number)
    await harnesses.router.component.enterValue('conditionsInput', contractToCreate.conditions)
    await harnesses.router.component.clickElement('saveContractButton')
    await expectAsync(harnesses.router.component.messageBoxPresent(MessageType.ERROR)).toBeResolvedTo(true)
    expect(Utilities.getLocationPath()).toBe('/contract')
  })

  it('edit - navigate back on success', async () => {
    contractServiceMock.updateContract.and.returnValue(of(void 0))
    const {
      harnesses
    } = await initComponent(existingContract.id)
    const contractToUpdate = {
      number: `${existingContract.number}_ED`,
      conditions: `${existingContract.conditions} (edited)`
    }

    await harnesses.router.component.enterValue('numberInput', contractToUpdate.number)
    await harnesses.router.component.enterValue('conditionsInput', contractToUpdate.conditions)
    await harnesses.router.component.clickElement('saveContractButton')
    expect(contractServiceMock.updateContract).toHaveBeenCalledWith(existingContract.id, jasmine.objectContaining(contractToUpdate))
    expect(Utilities.getLocationPath()).toBe('/initial')
  })

  it('edit - handle backend error', async () => {
    contractServiceMock.updateContract.and.returnValue(throwBackendError())
    const {
      harnesses
    } = await initComponent(existingContract.id)
    const contractToUpdate = {
      number: `${existingContract.number}_ED`,
      conditions: `${existingContract.conditions} (edited)`
    }

    await harnesses.router.component.enterValue('numberInput', contractToUpdate.number)
    await harnesses.router.component.enterValue('conditionsInput', contractToUpdate.conditions)
    await harnesses.router.component.clickElement('saveContractButton')
    await expectAsync(harnesses.router.component.messageBoxPresent(MessageType.ERROR)).toBeResolvedTo(true)
    expect(Utilities.getLocationPath()).toBe(`/contract?contractId=${existingContract.id}`)
  })

  it('common - navigate back on cancel', async () => {
    const {
      harnesses
    } = await initComponent()
    const contractToCreate = {
      number: 'APX3000',
      conditions: '3 year labour contract'
    }

    await harnesses.router.component.enterValue('numberInput', contractToCreate.number)
    await harnesses.router.component.enterValue('conditionsInput', contractToCreate.conditions)
    await harnesses.router.component.clickElement('cancelSaveContractButton')
    expect(Utilities.getLocationPath()).toBe('/initial')
  })

  it('edit - populate form with existing contract data', async () => {
    const {
      harnesses
    } = await initComponent()
    await harnesses.router.navigateByUrl(`/contract?contractId=${existingContract.id}`)

    await harnesses.router.component.expectInputValue('numberInput', existingContract.number)
    await harnesses.router.component.expectInputValue('conditionsInput', existingContract.conditions)
    await harnesses.router.component.expectButtonEnabled('saveContractButton', true)
  })

  it('edit - form reacts to query param change', async () => {
    const {
      harnesses
    } = await initComponent()
    await harnesses.router.navigateByUrl(`/contract?contractId=${existingContract.id}`)

    await harnesses.router.component.expectInputValue('numberInput', existingContract.number)
    await harnesses.router.component.expectInputValue('conditionsInput', existingContract.conditions)
    await harnesses.router.component.expectButtonEnabled('saveContractButton', true)

    await harnesses.router.navigateByUrl(`/contract?contractId=${anotherExistingContract.id}`)

    await harnesses.router.component.expectInputValue('numberInput', anotherExistingContract.number)
    await harnesses.router.component.expectInputValue('conditionsInput', anotherExistingContract.conditions)
    await harnesses.router.component.expectButtonEnabled('saveContractButton', true)
  })

  it('edit - form is cleared when switching to add mode', async () => {
    const {
      harnesses
    } = await initComponent()
    await harnesses.router.navigateByUrl(`/contract?contractId=${existingContract.id}`)

    await harnesses.router.component.expectInputValue('numberInput', existingContract.number)
    await harnesses.router.component.expectInputValue('conditionsInput', existingContract.conditions)
    await harnesses.router.component.expectButtonEnabled('saveContractButton', true)

    await harnesses.router.navigateByUrl(`/contract`)

    await harnesses.router.component.expectInputValue('numberInput', '')
    await harnesses.router.component.expectInputValue('conditionsInput', '')
    await harnesses.router.component.expectButtonEnabled('saveContractButton', false)
  })

  it('edit - form is populated when switching from add mode', async () => {
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.navigateByUrl(`/contract`)

    await harnesses.router.component.expectInputValue('numberInput', '')
    await harnesses.router.component.expectInputValue('conditionsInput', '')
    await harnesses.router.component.expectButtonEnabled('saveContractButton', false)

    await harnesses.router.navigateByUrl(`/contract?contractId=${existingContract.id}`)

    await harnesses.router.component.expectInputValue('numberInput', existingContract.number)
    await harnesses.router.component.expectInputValue('conditionsInput', existingContract.conditions)
    await harnesses.router.component.expectButtonEnabled('saveContractButton', true)
  })

  it('edit - form remains empty in case of data fetch error', async () => {
    contractServiceMock.getContract.withArgs(existingContract.id).and.returnValue(throwBackendError())
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.navigateByUrl(`/contract?contractId=${existingContract.id}`)
    await expectAsync(harnesses.router.component.messageBoxPresent(MessageType.ERROR)).toBeResolvedTo(true)
    await harnesses.router.component.expectInputValue('numberInput', '')
    await harnesses.router.component.expectInputValue('conditionsInput', '')
    await harnesses.router.component.expectButtonEnabled('saveContractButton', false)
  })

  it('edit - form populated after data fetch error on param change', async () => {
    contractServiceMock.getContract.withArgs(existingContract.id).and.returnValue(throwBackendError())
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.navigateByUrl(`/contract?contractId=${existingContract.id}`)
    await harnesses.router.navigateByUrl(`/contract?contractId=${anotherExistingContract.id}`)

    await harnesses.router.component.expectInputValue('numberInput', anotherExistingContract.number)
    await harnesses.router.component.expectInputValue('conditionsInput', anotherExistingContract.conditions)
    await harnesses.router.component.expectButtonEnabled('saveContractButton', true)
  })

  it('edit - form data is not changed on data fetch error after param change', async () => {
    contractServiceMock.getContract.withArgs(anotherExistingContract.id).and.returnValue(throwBackendError())
    const {
      harnesses
    } = await initComponent()

    await harnesses.router.navigateByUrl(`/contract?contractId=${existingContract.id}`)
    await harnesses.router.navigateByUrl(`/contract?contractId=${anotherExistingContract.id}`)

    await harnesses.router.component.expectInputValue('numberInput', existingContract.number)
    await harnesses.router.component.expectInputValue('conditionsInput', existingContract.conditions)
    await harnesses.router.component.expectButtonEnabled('saveContractButton', true)
  })
})
