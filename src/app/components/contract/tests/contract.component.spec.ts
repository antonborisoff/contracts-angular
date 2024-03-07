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
  of,
  throwError
} from 'rxjs'
import {
  BackendErrorHandlerService
} from '../../../services/backend-error-handler/backend-error-handler.service'
import {
  Location
} from '@angular/common'
import {
  Contract
} from '../../../interfaces/contract'

describe('ContractComponent', () => {
  let contractServiceMock: jasmine.SpyObj<ContractService>
  let backendErrorHandlerServiceMock: jasmine.SpyObj<BackendErrorHandlerService>
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

  async function initComponent(): Promise<{
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

    const routerHarness = await RouterTestingHarness.create('/initial')
    await routerHarness.navigateByUrl('/contract')
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
      'getContract'
    ])
    const contracts = [
      existingContract,
      anotherExistingContract
    ]
    contracts.forEach((contract) => {
      contractServiceMock.getContract.withArgs(contract.id).and.returnValue(of(contract))
    })
    backendErrorHandlerServiceMock = jasmine.createSpyObj<BackendErrorHandlerService>('backendErrorHandler', ['handleError'])
  })

  it('enable/disable create button based on form validity', async () => {
    const {
      contractHarness
    } = await initComponent()

    // initial state
    // invalid form: number missing, conditions missing
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(false)

    // invalid form: number present, conditions missing
    await contractHarness.enterValue('numberInput', 'APX3000')
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(false)

    // valid form: number present, conditions present
    await contractHarness.enterValue('conditionsInput', '3 year labour contract')
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(true)

    // valid form: number present, conditions missing
    await contractHarness.enterValue('conditionsInput', '')
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(false)

    // valid form: number present, conditions missing (whitespaces are ignored for conditions)
    await contractHarness.enterValue('conditionsInput', ' ')
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(false)

    // invalid form: number missing, conditions present
    await contractHarness.enterValue('conditionsInput', '3 year labour contract')
    await contractHarness.enterValue('numberInput', '')
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(false)

    // invalid form: number missing, conditions present (whitespaces are ignored for number)
    await contractHarness.enterValue('numberInput', ' ')
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(false)
  })

  it('display/hide error message based on number validity', async () => {
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

  it('display/hide error message based on conditions validity', async () => {
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

  it('navigate back on successful creation', async () => {
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
    await contractHarness.clickButton('createContractButton')
    expect(contractServiceMock.createContract).toHaveBeenCalledWith(jasmine.objectContaining(contractToCreate))
    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/initial')
  })

  it('handle backend error during creation', async () => {
    contractServiceMock.createContract.and.callFake(() => {
      return throwError(() => new Error('something went wrong'))
    })
    const {
      contractHarness
    } = await initComponent()
    const contractToCreate = {
      number: 'APX3000',
      conditions: '3 year labour contract'
    }

    await contractHarness.enterValue('numberInput', contractToCreate.number)
    await contractHarness.enterValue('conditionsInput', contractToCreate.conditions)
    await contractHarness.clickButton('createContractButton')
    expect(backendErrorHandlerServiceMock.handleError).toHaveBeenCalledWith()
    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/contract')
  })

  it('navigate back on cancel', async () => {
    const {
      contractHarness
    } = await initComponent()
    const contractToCreate = {
      number: 'APX3000',
      conditions: '3 year labour contract'
    }

    await contractHarness.enterValue('numberInput', contractToCreate.number)
    await contractHarness.enterValue('conditionsInput', contractToCreate.conditions)
    await contractHarness.clickButton('cancelCreateContractButton')
    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/initial')
  })

  it('edit mode - populate form with existing contract data', async () => {
    const {
      contractHarness, routerHarness
    } = await initComponent()
    await routerHarness.navigateByUrl(`/contract?contractId=${existingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe(existingContract.number)
    expect(await contractHarness.inputValue('conditionsInput')).toBe(existingContract.conditions)
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(true)
  })

  it('edit mode - form reacts to query param change', async () => {
    const {
      contractHarness, routerHarness
    } = await initComponent()
    await routerHarness.navigateByUrl(`/contract?contractId=${existingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe(existingContract.number)
    expect(await contractHarness.inputValue('conditionsInput')).toBe(existingContract.conditions)
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(true)

    await routerHarness.navigateByUrl(`/contract?contractId=${anotherExistingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe(anotherExistingContract.number)
    expect(await contractHarness.inputValue('conditionsInput')).toBe(anotherExistingContract.conditions)
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(true)
  })

  it('edit mode - form is cleared when switching to add mode', async () => {
    const {
      contractHarness, routerHarness
    } = await initComponent()
    await routerHarness.navigateByUrl(`/contract?contractId=${existingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe(existingContract.number)
    expect(await contractHarness.inputValue('conditionsInput')).toBe(existingContract.conditions)
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(true)

    await routerHarness.navigateByUrl(`/contract`)

    expect(await contractHarness.inputValue('numberInput')).toBe('')
    expect(await contractHarness.inputValue('conditionsInput')).toBe('')
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(false)
  })

  it('edit mode - form is populated when switching from add mode', async () => {
    const {
      contractHarness, routerHarness
    } = await initComponent()

    await routerHarness.navigateByUrl(`/contract`)

    expect(await contractHarness.inputValue('numberInput')).toBe('')
    expect(await contractHarness.inputValue('conditionsInput')).toBe('')
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(false)

    await routerHarness.navigateByUrl(`/contract?contractId=${existingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe(existingContract.number)
    expect(await contractHarness.inputValue('conditionsInput')).toBe(existingContract.conditions)
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(true)
  })

  it('edit mode - form remains empty in case of data fetch error', async () => {
    contractServiceMock.getContract.withArgs(existingContract.id).and.callFake(() => {
      return throwError(() => new Error('something went wrong'))
    })
    const {
      contractHarness, routerHarness
    } = await initComponent()

    await routerHarness.navigateByUrl(`/contract?contractId=${existingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe('')
    expect(await contractHarness.inputValue('conditionsInput')).toBe('')
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(false)
    expect(backendErrorHandlerServiceMock.handleError).toHaveBeenCalledWith()
  })

  it('edit mode - form populated after data fetch error on param change', async () => {
    contractServiceMock.getContract.withArgs(existingContract.id).and.callFake(() => {
      return throwError(() => new Error('something went wrong'))
    })
    const {
      contractHarness, routerHarness
    } = await initComponent()

    await routerHarness.navigateByUrl(`/contract?contractId=${existingContract.id}`)
    await routerHarness.navigateByUrl(`/contract?contractId=${anotherExistingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe(anotherExistingContract.number)
    expect(await contractHarness.inputValue('conditionsInput')).toBe(anotherExistingContract.conditions)
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(true)
  })

  it('edit mode - form data is not changed on data fetch error after param change', async () => {
    contractServiceMock.getContract.withArgs(anotherExistingContract.id).and.callFake(() => {
      return throwError(() => new Error('something went wrong'))
    })
    const {
      contractHarness, routerHarness
    } = await initComponent()

    await routerHarness.navigateByUrl(`/contract?contractId=${existingContract.id}`)
    await routerHarness.navigateByUrl(`/contract?contractId=${anotherExistingContract.id}`)

    expect(await contractHarness.inputValue('numberInput')).toBe(existingContract.number)
    expect(await contractHarness.inputValue('conditionsInput')).toBe(existingContract.conditions)
    expect(await contractHarness.buttonEnabled('createContractButton')).toBe(true)
  })
})
