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
  let homeHarness: HomeHarness

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        getTranslocoTestingModule(HomeComponent, en)
      ],
      providers: []
    }).compileComponents()

    const fixture = TestBed.createComponent(HomeComponent)
    homeHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, HomeHarness)
  })

  it('display welcome message', async () => {
    expect(await homeHarness.controlPresent('welcomeMessage')).toBe(true)
  })
})
