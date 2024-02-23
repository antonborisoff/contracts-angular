import {
  ComponentHarness,
  TestElement
} from '@angular/cdk/testing'

export class AppHarness extends ComponentHarness {
  public static hostSelector = 'app-root'

  private async getButton(id: string, ignoreDisabled: boolean = true): Promise<TestElement> {
    return await this.locatorFor(`button[data-id="${id}"]${ignoreDisabled ? '' : ':not([disabled])'}`)()
  }

  private async getH1(id: string, optional: boolean = false): Promise<TestElement | null> {
    return await this[optional ? 'locatorForOptional' : 'locatorFor'](`h1[data-id="${id}"]`)()
  }

  public async clickButton(id: string): Promise<void> {
    const button = await this.getButton(id, false)
    await button.click()
  }

  public async controlText(id: string): Promise<string> {
    const text = await this.getH1(id)
    return await text?.text() || ''
  }

  public async controlPresent(id: string): Promise<boolean> {
    return !!(await this.locatorForOptional(`h1[data-id="${id}"],button[data-id="${id}"]`)())
  }
}
