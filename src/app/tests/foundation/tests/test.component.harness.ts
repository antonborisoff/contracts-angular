import {
  BaseHarness
} from '../base.component.harness'

export class TestComponentHarness extends BaseHarness {
  public static hostSelector = 'app-test-component'

  // only required for testing base harness assertions to make sure test template is populated with expected elements;
  // not needed in base harness itself;
  // should not be moved to base harness;
  public async elementPresent(id: string, tag: string): Promise<boolean> {
    const element = await this.locatorForOptional(`${this.ancestorSelector}${tag}${this.getIdSelector(id)}`)()
    return !!element
  }
}
