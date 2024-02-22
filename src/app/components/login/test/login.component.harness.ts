import {
  ComponentHarness,
  TestElement
} from '@angular/cdk/testing'

export class LoginHarness extends ComponentHarness {
  public static hostSelector = 'app-login'

  private async getInput(id: string): Promise<TestElement> {
    return await this.locatorFor(`input[data-id="${id}"]`)()
  }

  private async getButton(id: string, ignoreDisabled: boolean = true): Promise<TestElement> {
    return await this.locatorFor(`button[data-id="${id}"]${ignoreDisabled ? '' : ':not([disabled])'}`)()
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

  public async clickButton(id: string): Promise<void> {
    const button = await this.getButton(id, false)
    await button.click()
  }

  public async buttonEnabled(id: string): Promise<boolean> {
    const button = await this.getButton(id)
    return !(await button.getProperty('disabled'))
  }

  public async controlPresent(id: string): Promise<boolean> {
    return !!(await this.getDiv(id, true))
  }
}
