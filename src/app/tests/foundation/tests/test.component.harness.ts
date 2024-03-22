import {
  BaseHarness
} from '../base.component.harness'
import {
  WaitingHarness
} from '../waiting.component.harness'

export class TestComponentHarness extends BaseHarness {
  public static hostSelector = 'app-test-component'

  /**
   * 1. only required for testing base harness assertions to make sure test template is populated with expected elements;
   * 2. not needed in base harness itself;
   * 3. should not be moved to base harness;
   * 4. supposed to consider immediate snapshot of the current template state, thus doesn't use waitFor mechanism;
   */
  public async elementPresent(id: string, tag: string): Promise<boolean> {
    const element = await this.locatorForOptional(`${this.ancestorSelector}${tag}${this.getIdSelector(id)}`)()
    return !!element
  }

  /**
   * 1. only required for testing base harness assertions;
   * 2. not needed in base harness itself;
   * 3. should not be moved to base harness;
   * 4. supposed to consider immediate snapshot of the current template state, thus doesn't use waitFor mechanism;
   */
  public async elementBusy(id: string): Promise<boolean> {
    const element = await this.locatorFor(`div${this.getIdSelector(id)}`)()
    const busyState = await element.getAttribute('data-busy')
    return busyState === 'true' || busyState === null
  }
}

export class WaitingTestComponentHarness extends WaitingHarness {
  public static hostSelector = 'app-test-component'
}
