import {
  BaseHarness
} from '../base.component.harness'
import {
  WaitingHarness
} from '../waiting.component.harness'

export class TestComponentHarness extends BaseHarness {
  public static hostSelector = 'app-test-component'

  // only required for testing base harness assertions to make sure test template is populated with expected elements;
  // not needed in base harness itself;
  // should not be moved to base harness;
  public async elementPresent(id: string, tag: string): Promise<boolean> {
    const element = await this.locatorForOptional(`${this.ancestorSelector}${tag}${this.getIdSelector(id)}`)()
    return !!element
  }

  // only required for testing waitForElementNotBusy to check that it indeed waits for element becoming not busy,
  // thus must not wait for element to become free;
  // not needed in base harness itself;
  // should not be moved to base harness;
  public async elementBusy(id: string): Promise<boolean> {
    const element = await this.locatorFor(`div${this.getIdSelector(id)}`)()
    const busyState = await element.getAttribute('data-busy')
    return busyState === 'true' || busyState === null
  }
}

export class WaitingTestComponentHarness extends WaitingHarness {
  public static hostSelector = 'app-test-component'
}
