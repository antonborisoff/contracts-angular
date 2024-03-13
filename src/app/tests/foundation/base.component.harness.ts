import {
  ComponentHarness,
  HarnessPredicate
} from '@angular/cdk/testing'
import {
  MatTableHarness,
  MatRowHarness
} from '@angular/material/table/testing'

interface ancestorHarnessConfig<T extends ComponentHarness> {
  itemTag: string
  itemHarnessPredicate: HarnessPredicate<T>
}

export class BaseHarness extends ComponentHarness {
  private idAttribute = 'data-id'
  // TODO: convert to private once ancestorSelector is managed centrally via getCssSelector (not passed to it)
  protected ancestorSelector: string = ''

  protected ancestorHarnessConfig?: ancestorHarnessConfig<MatRowHarness>

  protected getIdSelector(id: string): string {
    return `[${this.idAttribute}="${id}"]`
  }

  protected getCssSelector(id: string, tags: string[], ancestorSelector: string = ''): string {
    return tags.reduce((selector: string, tag: string) => {
      if (selector) {
        selector = `${selector},`
      }
      return `${selector}${ancestorSelector}${tag}${this.getIdSelector(id)}`
    }, '')
  }

  protected async updateAncestorSelector(): Promise<void> {
    if (this.ancestorHarnessConfig) {
      const harness = await this.locatorFor(this.ancestorHarnessConfig.itemHarnessPredicate)()
      const host = await harness.host()
      const hostId = await host.getAttribute(this.idAttribute)
      if (!hostId) {
        throw new Error(`Cannot execute the method: the host element of the harness returned by the wrapper does not have ${this.idAttribute} property`)
      }
      this.ancestorSelector = `${this.ancestorHarnessConfig.itemTag}${this.getIdSelector(hostId)} `
    }
  }

  /********************************
   * WRAPPERS
   *******************************/
  public inElement(id: string): this {
    const copy = Object.create(
      Object.getPrototypeOf(this),
      Object.getOwnPropertyDescriptors(this)
    ) as this
    copy.ancestorSelector = `div${this.getIdSelector(id)} `
    return copy
  }

  public inMatTableRow(tableId: string, rowFilter: Record<string, string>): this {
    const copy = Object.create(
      Object.getPrototypeOf(this),
      Object.getOwnPropertyDescriptors(this)
    ) as this
    copy.ancestorHarnessConfig = {
      itemHarnessPredicate: MatRowHarness.with({
        ancestor: this.getIdSelector(tableId)
      }).addOption(`row`, rowFilter, async (harness, rowFilter) => {
        const rowValues = await harness.getCellTextByColumnName()
        return Object.keys(rowFilter).every((key) => {
          return rowValues[key] === rowFilter[key]
        })
      }),
      itemTag: 'tr'
    }
    return copy
  }
  /********************************
   * ACTIONS
   *******************************/

  public async clickButton(id: string): Promise<void> {
    await this.updateAncestorSelector()
    const button = await this.locatorFor(`${this.ancestorSelector}button${this.getIdSelector(id)}:not([disabled])`)()
    await button.click()
  }

  public async clickLink(id: string): Promise<void> {
    const link = await this.locatorFor(`a${this.getIdSelector(id)}`)()
    await link.click()
  }

  public async clickMatCard(id: string): Promise<void> {
    const matCard = await this.locatorFor(`mat-card${this.getIdSelector(id)}`)()
    await matCard.click()
  }

  public async enterValue(id: string, value: string, blur: boolean = true): Promise<void> {
    const cssSelector = this.getCssSelector(id, [
      'input',
      'textarea'
    ])
    const input = await this.locatorFor(cssSelector)()
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
      'button',
      'a',
      'td',
      'mat-error',
      'mat-card'
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
    await this.updateAncestorSelector()
    const cssSelector = this.getCssSelector(id, [
      'h1',
      'h4',
      'p',
      'div',
      'td',
      'mat-icon'
    ], this.ancestorSelector)
    const element = await this.locatorFor(cssSelector)()
    return await element.text()
  }

  public async elementChildCount(id: string): Promise<number> {
    // we need to retrieve the parent first to make sure it exists
    await this.locatorFor(`div${this.getIdSelector(id)}`)()
    const children = await this.locatorForAll(`div${this.getIdSelector(id)} > *`)()
    return children.length
  }

  public async buttonEnabled(id: string): Promise<boolean> {
    const button = await this.locatorFor(`button${this.getIdSelector(id)}`)()
    return !(await button.getProperty('disabled'))
  }

  public async inputValue(id: string): Promise<string> {
    const cssSelector = this.getCssSelector(id, [
      'input',
      'textarea'
    ])
    const input = await this.locatorFor(cssSelector)()
    return await input.getProperty('value')
  }

  public async matTableNRows(id: string): Promise<number> {
    const matTable = await this.locatorFor(MatTableHarness.with({
      selector: this.getIdSelector(id)
    }))()
    const rows = await matTable.getRows()
    return rows.length
  }
}
