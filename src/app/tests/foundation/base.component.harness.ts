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

  public async elementVisible(id: string): Promise<boolean> {
    const cssSelector = [
      'h1',
      'p',
      'div',
      'button'
    ].reduce((selector: string, tag: string) => {
      if (selector) {
        selector = `${selector},`
      }
      return `${selector}${tag}${this.getIdSelector(id)}`
    }, '')
    const element = await this.locatorForOptional(cssSelector)()
    if (element) {
      const display = await element.getCssValue('display')
      const visibility = await element.getCssValue('visibility')
      return display !== 'none' && visibility !== 'hidden'
    }
    else {
      return false
    }
  }

  public async buttonEnabled(id: string): Promise<boolean> {
    const button = await this.locatorFor(`button${this.getIdSelector(id)}`)()
    return !(await button.getProperty('disabled'))
  }
}
