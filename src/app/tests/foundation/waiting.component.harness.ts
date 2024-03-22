import {
  ComponentHarness,
  TestElement
} from '@angular/cdk/testing'
import {
  BaseHarness
} from './base.component.harness'

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 *
 * This base harness is designed for testing environments with async operations beyond Angular framework e.g. e2e tests against real apps;
 * It provides common waiters that might indicate such operations completion and general framework to implement custom waiters;
 * The methods are based on visual indications of such operations completion;
 * UX requires such indicators to be present to notify users about ongoing operations;
 */
export class WaitingHarness extends BaseHarness {
  protected waitForTimeoutInterval = 15000
  protected waitForPollingInterval = 400

  protected override async waitFor<T extends TestElement | ComponentHarness | boolean>(options: {
    lookup: () => Promise<T | null>
    action?: (result: T) => Promise<void>
    errorMessage: string
  }): Promise<void> {
    let result = await options.lookup()
    const endTime = Date.now() + this.waitForTimeoutInterval
    while (!result && Date.now() < endTime) {
      await wait(this.waitForPollingInterval)
      result = await options.lookup()
    }
    if (!result) {
      throw new Error(options.errorMessage)
    }
    else {
      if (options.action) {
        await options.action(result)
      }
    }
  }

  public withTimeout(timeoutInterval?: number): this {
    if (timeoutInterval) {
      const copy = Object.create(
        Object.getPrototypeOf(this),
        Object.getOwnPropertyDescriptors(this)
      ) as this
      copy.waitForTimeoutInterval = timeoutInterval
      return copy
    }
    else {
      return this
    }
  }

  // for elements blocked with appBusy directive
  public async expectElementFree(id: string): Promise<void> {
    await this.waitFor({
      lookup: async () => {
        const cssSelector = this.getCssSelector(id, ['div'], this.ancestorSelector, ':not([data-busy="true"])')
        return !!(await this.locatorForOptional(cssSelector)())
      },
      errorMessage: `Waiting for element ${id} becoming free failed: timeout exceeded, but element is still busy.`
    })
  }

  // for elements hidden via @if + async
  public async expectElementPresent(id: string, present: boolean = true): Promise<void> {
    let errorMessage: string
    if (present) {
      errorMessage = `Waiting for element ${id} being present failed: timeout exceeded, but element is still not present.`
    }
    else {
      errorMessage = `Waiting for element ${id} not being present failed: timeout exceeded, but element is still present.`
    }
    await this.waitFor({
      lookup: async () => {
        const cssSelector = this.getCssSelector(id, ['div'], this.ancestorSelector)
        return !!(await this.locatorForOptional(cssSelector)()) === present
      },
      errorMessage: errorMessage
    })
  }
}
