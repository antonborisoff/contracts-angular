import {
  TestBed
} from '@angular/core/testing'
import {
  getTranslocoTestingModule
} from '../../../../transloco/transloco-testing'
import en from '../i18n/en.json'
import {
  TestbedHarnessEnvironment
} from '@angular/cdk/testing/testbed'
import {
  RouterTestingHarness,
  RouterTestingModule
} from '@angular/router/testing'
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
  Location
} from '@angular/common'
import {
  Contract
} from '../../../interfaces/contract'
import {
  Utilities
} from '../../../tests/foundation/utilities'
import {
  throwBackendError
} from '../../../tests/utils'

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

  async function initComponent(contractId: string | void): Promise<{
    contractHarness: ContractHarness
    routerHarness: RouterTestingHarness
  }> {
    await TestBed.configureTestingModule({
      imports: [
        ContractComponent,
        getTranslocoTestingModule(ContractComponent, en),
        // we need to use contract component for both routes to make sure
        // navigationBackService is initialized at the same time as root component
        // created by RouterTestingHarness.create();
        // if we use TestComponent for initial route, it won't be the case and some history will be missing;
        RouterTestingModule.withRoutes([
          {
            path: 'initial',
            component: ContractComponent
          },
          {
            path: 'contract',
            component: ContractComponent
          }
        ])
      ],
      providers: [{
        provide: ContractService,
        useValue: contractServiceMock
      }]
    }).compileComponents()

    const routerHarness = await RouterTestingHarness.create('/initial')
    await routerHarness.navigateByUrl(contractId ? `/contract?contractId=${contractId}` : '/contract')
    const rootFixture = routerHarness.fixture
    const rootHarnessLoader = TestbedHarnessEnvironment.loader(rootFixture)
    const contractHarness = await rootHarnessLoader.getHarness(ContractHarness)
    return {
      contractHarness,
      routerHarness
    }
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
      contractHarness
    } = await initComponent()

    // initial state
    // invalid form: number missing, conditions missing
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(false)

    // invalid form: number present, conditions missing
    await contractHarness.enterValue('numberInput', 'APX3000')
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(false)

    // valid form: number present, conditions present
    await contractHarness.enterValue('conditionsInput', '3 year labour contract')
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(true)

    // valid form: number present, conditions missing
    await contractHarness.enterValue('conditionsInput', '')
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(false)

    // valid form: number present, conditions missing (whitespaces are ignored for conditions)
    await contractHarness.enterValue('conditionsInput', ' ')
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(false)

    // invalid form: number missing, conditions present
    await contractHarness.enterValue('conditionsInput', '3 year labour contract')
    await contractHarness.enterValue('numberInput', '')
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(false)

    // invalid form: number missing, conditions present (whitespaces are ignored for number)
    await contractHarness.enterValue('numberInput', ' ')
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(false)
  })

  it('common - display/hide error message based on number validity', async () => {
    const {
      contractHarness
    } = await initComponent()

    // initial state: no validation done
    expect(await contractHarness.elementVisible('numberErrorEmpty')).toBe(false)

    // validation is not triggered until blur
    await contractHarness.enterValue('numberInput', '', false)
    expect(await contractHarness.elementVisible('numberErrorEmpty')).toBe(false)

    await contractHarness.enterValue('numberInput', '')
    expect(await contractHarness.elementVisible('numberErrorEmpty')).toBe(true)

    await contractHarness.enterValue('numberInput', 'APX3000')
    expect(await contractHarness.elementVisible('numberErrorEmpty')).toBe(false)

    // whitespaces are ignored
    await contractHarness.enterValue('numberInput', ' ')
    expect(await contractHarness.elementVisible('numberErrorEmpty')).toBe(true)
  })

  it('common - display/hide error message based on conditions validity', async () => {
    const {
      contractHarness
    } = await initComponent()

    // initial state: no validation done
    expect(await contractHarness.elementVisible('conditionsErrorEmpty')).toBe(false)

    // validation is not triggered until blur
    await contractHarness.enterValue('conditionsInput', '', false)
    expect(await contractHarness.elementVisible('conditionsErrorEmpty')).toBe(false)

    await contractHarness.enterValue('conditionsInput', '')
    expect(await contractHarness.elementVisible('conditionsErrorEmpty')).toBe(true)

    await contractHarness.enterValue('conditionsInput', '3 year labour contract')
    expect(await contractHarness.elementVisible('conditionsErrorEmpty')).toBe(false)

    // whitespaces are ignored
    await contractHarness.enterValue('conditionsInput', ' ')
    expect(await contractHarness.elementVisible('conditionsErrorEmpty')).toBe(true)
  })

  it('add - navigate back on success', async () => {
    contractServiceMock.createContract.and.returnValue(of('new_contract_id'))
    const {
      contractHarness
    } = await initComponent()
    const contractToCreate = {
      number: 'APX3000',
      conditions: '3 year labour contract'
    }

    await contractHarness.enterValue('numberInput', contractToCreate.number)
    await contractHarness.enterValue('conditionsInput', contractToCreate.conditions)
    await contractHarness.clickButton('saveContractButton')
    expect(contractServiceMock.createContract).toHaveBeenCalledWith(jasmine.objectContaining(contractToCreate))
    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/initial')
  })

  it('add - handle backend error', async () => {
    contractServiceMock.createContract.and.returnValue(throwBackendError())
    const {
      contractHarness
    } = await initComponent()
    const contractToCreate = {
      number: 'APX3000',
      conditions: '3 year labour contract'
    }

    expect(await Utilities.errorMessageBoxPresent(async () => {
      await contractHarness.enterValue('numberInput', contractToCreate.number)
      await contractHarness.enterValue('conditionsInput', contractToCreate.conditions)
      await contractHarness.clickButton('saveContractButton')
    })).toBe(true)
    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/contract')
  })

  it('edit - navigate back on success', async () => {
    contractServiceMock.updateContract.and.returnValue(of(void 0))
    const {
      contractHarness
    } = await initComponent(existingContract.id)
    const contractToUpdate = {
      number: `${existingContract.number}_ED`,
      conditions: `${existingContract.conditions} (edited)`
    }

    await contractHarness.enterValue('numberInput', contractToUpdate.number)
    await contractHarness.enterValue('conditionsInput', contractToUpdate.conditions)
    await contractHarness.clickButton('saveContractButton')
    expect(contractServiceMock.updateContract).toHaveBeenCalledWith(existingContract.id, jasmine.objectContaining(contractToUpdate))
    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/initial')
  })

  it('edit - handle backend error', async () => {
    contractServiceMock.updateContract.and.returnValue(throwBackendError())
    const {
      contractHarness
    } = await initComponent(existingContract.id)
    const contractToUpdate = {
      number: `${existingContract.number}_ED`,
      conditions: `${existingContract.conditions} (edited)`
    }

    expect(await Utilities.errorMessageBoxPresent(async () => {
      await contractHarness.enterValue('numberInput', contractToUpdate.number)
      await contractHarness.enterValue('conditionsInput', contractToUpdate.conditions)
      await contractHarness.clickButton('saveContractButton')
    })).toBe(true)
    const location = TestBed.inject(Location)
    expect(location.path()).toBe(`/contract?contractId=${existingContract.id}`)
  })

  it('common - navigate back on cancel', async () => {
    const {
      contractHarness
    } = await initComponent()
    const contractToCreate = {
      number: 'APX3000',
      conditions: '3 year labour contract'
    }

    await contractHarness.enterValue('numberInput', contractToCreate.number)
    await contractHarness.enterValue('conditionsInput', contractToCreate.conditions)
    await contractHarness.clickButton('cancelSaveContractButton')
    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/initial')
  })

  it('edit - populate form with existing contract data', async () => {
    const {
      contractHarness, routerHarness
    } = await initComponent()
    await routerHarness.navigateByUrl(`/contract?contractId=${existingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe(existingContract.number)
    expect(await contractHarness.inputValue('conditionsInput')).toBe(existingContract.conditions)
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(true)
  })

  it('edit - form reacts to query param change', async () => {
    const {
      contractHarness, routerHarness
    } = await initComponent()
    await routerHarness.navigateByUrl(`/contract?contractId=${existingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe(existingContract.number)
    expect(await contractHarness.inputValue('conditionsInput')).toBe(existingContract.conditions)
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(true)

    await routerHarness.navigateByUrl(`/contract?contractId=${anotherExistingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe(anotherExistingContract.number)
    expect(await contractHarness.inputValue('conditionsInput')).toBe(anotherExistingContract.conditions)
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(true)
  })

  it('edit - form is cleared when switching to add mode', async () => {
    const {
      contractHarness, routerHarness
    } = await initComponent()
    await routerHarness.navigateByUrl(`/contract?contractId=${existingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe(existingContract.number)
    expect(await contractHarness.inputValue('conditionsInput')).toBe(existingContract.conditions)
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(true)

    await routerHarness.navigateByUrl(`/contract`)

    expect(await contractHarness.inputValue('numberInput')).toBe('')
    expect(await contractHarness.inputValue('conditionsInput')).toBe('')
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(false)
  })

  it('edit - form is populated when switching from add mode', async () => {
    const {
      contractHarness, routerHarness
    } = await initComponent()

    await routerHarness.navigateByUrl(`/contract`)

    expect(await contractHarness.inputValue('numberInput')).toBe('')
    expect(await contractHarness.inputValue('conditionsInput')).toBe('')
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(false)

    await routerHarness.navigateByUrl(`/contract?contractId=${existingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe(existingContract.number)
    expect(await contractHarness.inputValue('conditionsInput')).toBe(existingContract.conditions)
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(true)
  })

  it('edit - form remains empty in case of data fetch error', async () => {
    contractServiceMock.getContract.withArgs(existingContract.id).and.returnValue(throwBackendError())
    const {
      contractHarness, routerHarness
    } = await initComponent()

    expect(await Utilities.errorMessageBoxPresent(async () => {
      await routerHarness.navigateByUrl(`/contract?contractId=${existingContract.id}`)
    })).toBe(true)
    expect(await contractHarness.inputValue('numberInput')).toBe('')
    expect(await contractHarness.inputValue('conditionsInput')).toBe('')
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(false)
  })

  it('edit - form populated after data fetch error on param change', async () => {
    contractServiceMock.getContract.withArgs(existingContract.id).and.returnValue(throwBackendError())
    const {
      contractHarness, routerHarness
    } = await initComponent()

    await routerHarness.navigateByUrl(`/contract?contractId=${existingContract.id}`)
    await routerHarness.navigateByUrl(`/contract?contractId=${anotherExistingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe(anotherExistingContract.number)
    expect(await contractHarness.inputValue('conditionsInput')).toBe(anotherExistingContract.conditions)
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(true)
  })

  it('edit - form data is not changed on data fetch error after param change', async () => {
    contractServiceMock.getContract.withArgs(anotherExistingContract.id).and.returnValue(throwBackendError())
    const {
      contractHarness, routerHarness
    } = await initComponent()

    await routerHarness.navigateByUrl(`/contract?contractId=${existingContract.id}`)
    await routerHarness.navigateByUrl(`/contract?contractId=${anotherExistingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe(existingContract.number)
    expect(await contractHarness.inputValue('conditionsInput')).toBe(existingContract.conditions)
    expect(await contractHarness.buttonEnabled('saveContractButton')).toBe(true)
  })
})
