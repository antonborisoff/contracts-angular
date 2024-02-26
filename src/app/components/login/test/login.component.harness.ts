import {
  TestElement
} from '@angular/cdk/testing'
import {
  BaseHarness
} from '../../../tests/foundation/base.component.harness'

export class LoginHarness extends BaseHarness {
  public static hostSelector = 'app-login'

  private async getInput(id: string): Promise<TestElement> {
    return await this.locatorFor(`input[data-id="${id}"]`)()
  }

  private async getDiv(id: string, optional: boolean = false): Promise<TestElement | null> {
    return await this[optional ? 'locatorForOptional' : 'locatorFor'](`div[data-id="${id}"]`)()
  }

  public async enterInputValue(id: string, value: string, blur: boolean = true): Promise<void> {
    const input = await this.getInput(id)
    if (value.length) {
      await input.setInputValue(value)
    }
    else {
      await input.clear()
    }
    await input.dispatchEvent('input')
    if (blur) {
      await input.blur()
    }
  }

  public async controlPresent(id: string): Promise<boolean> {
    return !!(await this.getDiv(id, true))
  }
}
