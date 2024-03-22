import {
  BaseHarness
} from '../../../tests/foundation/base.component.harness'

export class LoginHarness extends BaseHarness {
  public static hostSelector = 'app-login'

  /********************************
   * ACTIONS
   *******************************/

  /********************************
   * ASSERTIONS
   *******************************/
  public async expectInputType(id: string, type: string): Promise<void> {
    const cssSelector = `input${this.getIdSelector(id)}`
    await this.waitFor({
      lookup: async () => {
        const input = await this.locatorFor(cssSelector)()
        return await input.getAttribute('type') === type
      },
      errorMessage: `No element for selector ${cssSelector} with type '${type}' found`
    })
    this.markAssertionAsValidExpectation()
  }
}
