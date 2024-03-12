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
  public async inputType(id: string): Promise<string | null> {
    const input = await this.locatorFor(`input${this.getIdSelector(id)}`)()
    return await input.getAttribute('type')
  }
}
