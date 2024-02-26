import {
  ComponentHarness
} from '@angular/cdk/testing'

export class BaseHarness extends ComponentHarness {
  protected getIdSelector(id: string): string {
    return `[data-id="${id}"]`
  }
  /********************************
   * ACTIONS
   *******************************/

  public async clickButton(id: string): Promise<void> {
    const button = await this.locatorFor(`button${this.getIdSelector(id)}:not([disabled])`)()
    await button.click()
  }

  public async clickLink(id: string): Promise<void> {
    const link = await this.locatorFor(`a${this.getIdSelector(id)}`)()
    await link.click()
  }

  /********************************
   * ASSERTIONS
   *******************************/

  public async buttonEnabled(id: string): Promise<boolean> {
    const button = await this.locatorFor(`button${this.getIdSelector(id)}`)()
    return !(await button.getProperty('disabled'))
  }
}
