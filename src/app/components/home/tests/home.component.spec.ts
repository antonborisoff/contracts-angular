import {
  TestBed
} from '@angular/core/testing'

import {
  HomeComponent
} from '../home.component'
import {
  HomeHarness
} from './home.component.harness'
import {
  getTranslocoTestingModule
} from '../../../../transloco/transloco-testing'
import en from '../i18n/en.json'
import {
  TestbedHarnessEnvironment
} from '@angular/cdk/testing/testbed'

describe('HomeComponent', () => {
  async function initComponent(): Promise<{
    homeHarness: HomeHarness
  }> {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        getTranslocoTestingModule(HomeComponent, en)
      ],
      providers: []
    }).compileComponents()

    const fixture = TestBed.createComponent(HomeComponent)
    const homeHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, HomeHarness)
    return {
      homeHarness
    }
  }

  it('display welcome message', async () => {
    const {
      homeHarness
    } = await initComponent()

    expect(await homeHarness.elementVisible('welcomeMessage')).toBe(true)
  })
})
