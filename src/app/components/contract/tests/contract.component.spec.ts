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
  RouterTestingModule
} from '@angular/router/testing'
import {
  Router
} from '@angular/router'
import {
  ContractComponent
} from '../contract.component'
import {
  ContractHarness
} from './contract.component.harness'

describe('ContractComponent', () => {
  async function initComponent(): Promise<{
    contractHarness: ContractHarness
    router: Router
  }> {
    await TestBed.configureTestingModule({
      imports: [
        ContractComponent,
        getTranslocoTestingModule(ContractComponent, en),
        RouterTestingModule.withRoutes([])
      ],
      providers: []
    }).compileComponents()

    const router = TestBed.inject(Router)

    const fixture = TestBed.createComponent(ContractComponent)
    const contractHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ContractHarness)
    return {
      contractHarness,
      router
    }
  }

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
})
