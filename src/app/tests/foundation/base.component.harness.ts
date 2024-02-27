import {
  ComponentHarness
} from '@angular/cdk/testing'

export class BaseHarness extends ComponentHarness {
  protected getIdSelector(id: string): string {
    return `[data-id="${id}"]`
  }

  protected getCssSelector(id: string, tags: string[]): string {
    return tags.reduce((selector: string, tag: string) => {
      if (selector) {
        selector = `${selector},`
      }
      return `${selector}${tag}${this.getIdSelector(id)}`
    }, '')
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

  public async enterValue(id: string, value: string, blur: boolean = true): Promise<void> {
    const input = await this.locatorFor(`input${this.getIdSelector(id)}`)()
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

  /********************************
   * ASSERTIONS
   *******************************/

  public async elementVisible(id: string): Promise<boolean> {
    const cssSelector = this.getCssSelector(id, [
      'h1',
      'p',
      'div',
      'button'
    ])
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

  public async elementText(id: string): Promise<string> {
    const cssSelector = this.getCssSelector(id, [
      'h1',
      'p',
      'div'
    ])
    const element = await this.locatorFor(cssSelector)()
    return await element.text()
  }

  public async buttonEnabled(id: string): Promise<boolean> {
    const button = await this.locatorFor(`button${this.getIdSelector(id)}`)()
    return !(await button.getProperty('disabled'))
  }
}