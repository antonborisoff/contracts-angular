import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessLoader,
  HarnessPredicate,
  TestElement
} from '@angular/cdk/testing'
import {
  MatButtonHarness
} from '@angular/material/button/testing'
import {
  MatDialogHarness
} from '@angular/material/dialog/testing'
import {
  MatIconHarness
} from '@angular/material/icon/testing'
import {
  MatMenuItemHarness
} from '@angular/material/menu/testing'
import {
  MatTableHarness,
  MatRowHarness
} from '@angular/material/table/testing'
import {
  MessageActions,
  MessageType
} from '../../services/message-box/interfaces'

interface ancestorHarnessConfig<T extends ComponentHarness> {
  itemTag: string
  itemHarnessPredicate: HarnessPredicate<T>
}

export class BaseHarness extends ComponentHarness {
  private idAttribute = 'data-id'
  private rootLoader?: HarnessLoader

  public initRootLoader(loader: HarnessLoader): void {
    if (!this.rootLoader) {
      this.rootLoader = loader
    }
  }

  protected getRootLoader(): HarnessLoader {
    if (!this.rootLoader) {
      throw new Error('root loader was not initialized')
    }
    return this.rootLoader
  }

  // TODO: convert to private once ancestorSelector is managed centrally via getCssSelector (not passed to it)
  protected ancestorSelector: string = ''
  protected ancestorHarnessConfig?: ancestorHarnessConfig<MatRowHarness>

  protected getIdSelector(id: string): string {
    return `[${this.idAttribute}="${id}"]`
  }

  protected getCssSelector(id: string, tags: string[], ancestorSelector: string = '', postfix: string = ''): string {
    return tags.reduce((selector: string, tag: string) => {
      if (selector) {
        selector = `${selector},`
      }
      return `${selector}${ancestorSelector}${tag}${this.getIdSelector(id)}${postfix}`
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

  protected async waitFor<T extends TestElement | ComponentHarness | boolean>(options: {
    lookup: () => Promise<T | null>
    action?: (result: T) => Promise<void>
    errorMessage: string
  }): Promise<void> {
    // no need to do polling in unit tests
    // since component harnesses stabilize them internally
    let result: T | null
    try {
      result = await options.lookup()
    }
    catch (err) {
      result = null
    }
    if (!result) {
      throw new Error(options.errorMessage)
    }
    else {
      if (options.action) {
        await options.action(result)
      }
    }
  }

  protected markAssertionAsValidExpectation(): void {
    // this is needed to make Jasmine and its reporter
    // treat our custom assertions as valid expectations;
    // otherwise they will mark specs with only custom assertions
    // as ones without expectations;
    expect(1).toBe(1)
  }

  /********************************
   * WRAPPERS
   *******************************/
  // +
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

  // for interaction within an open mat dialog
  public async matDialogHarness<T extends BaseHarness>(dialogId: string, harness: ComponentHarnessConstructor<T>): Promise<T> {
    const matDialog = await this.getRootLoader().getHarness(MatDialogHarness.with({
      selector: `#${dialogId}`
    }))
    return await matDialog.getHarness(harness)
  }

  /********************************
   * ACTIONS
   *******************************/
  // +
  public async clickElement(id: string): Promise<void> {
    await this.updateAncestorSelector()
    const disabableTags = ['button']
    const regularTags = [
      'a',
      'div',
      'mat-card'
    ]
    const cssSelectorDisabable = this.getCssSelector(id, disabableTags, this.ancestorSelector, ':not([disabled])')
    const cssSelectorRegular = this.getCssSelector(id, regularTags, this.ancestorSelector)

    await this.waitFor({
      lookup: async () => {
        return await this.locatorFor(`${cssSelectorDisabable},${cssSelectorRegular}`)()
      },
      errorMessage: `No element for selector ${cssSelectorDisabable},${cssSelectorRegular} found.`,
      action: async (element: TestElement) => {
        await element.click()
      }
    })
  }

  public async selectMatMenuItem(text: string): Promise<void> {
    const matMenuItem = await this.getRootLoader().getHarness(MatMenuItemHarness.with({
      text: text
    }))
    await matMenuItem.click()
  }

  // +
  public async messageBoxClick(action: MessageActions): Promise<void> {
    const messageBox = await this.getRootLoader().getHarness(MatDialogHarness)
    const button = await messageBox.getHarness(MatButtonHarness.with({
      selector: `${this.getIdSelector(`${action}Button`)}`
    }))
    await button.click()
  }

  // +
  public async enterValue(id: string, value: string, blur: boolean = true): Promise<void> {
    const cssSelector = this.getCssSelector(id, [
      'input',
      'textarea'
    ])
    await this.waitFor({
      lookup: async () => {
        return await this.locatorFor(cssSelector)()
      },
      errorMessage: `No element for selector ${cssSelector} found.`,
      action: async (input) => {
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
    })
  }

  /********************************
   * ASSERTIONS
   *******************************/
  // +
  public async expectElementVisible(id: string, visible: boolean): Promise<void> {
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
    await this.waitFor({
      lookup: async () => {
        let elementVisible: boolean
        const element = await this.locatorForOptional(cssSelector)()
        if (element) {
          const display = await element.getCssValue('display')
          const visibility = await element.getCssValue('visibility')
          elementVisible = (display !== 'none' && visibility !== 'hidden')
        }
        else {
          elementVisible = false
        }
        return elementVisible === visible
      },
      errorMessage: `No ${visible ? 'visible' : 'invisible'} element for selector ${cssSelector} found`
    })
    this.markAssertionAsValidExpectation()
  }

  // +
  public async expectElementText(id: string, text: string): Promise<void> {
    await this.updateAncestorSelector()
    const cssSelector = this.getCssSelector(id, [
      'h1',
      'h4',
      'p',
      'div',
      'span',
      'button',
      'td',
      'mat-icon'
    ], this.ancestorSelector)
    await this.waitFor({
      lookup: async () => {
        const element = await this.locatorFor(cssSelector)()
        return await element.text() === text
      },
      errorMessage: `No element for selector ${cssSelector} with text '${text}' found`
    })
    this.markAssertionAsValidExpectation()
  }

  // +
  public async expectElementClass(id: string, cssClass: string, present: boolean): Promise<void> {
    await this.updateAncestorSelector()
    const cssSelector = this.getCssSelector(id, [
      'mat-toolbar',
      'button'
    ], this.ancestorSelector)

    await this.waitFor({
      lookup: async () => {
        const element = await this.locatorFor(cssSelector)()
        return await element.hasClass(cssClass) === present
      },
      errorMessage: `No element for selector ${cssSelector} with css class '${cssClass}' found`
    })
    this.markAssertionAsValidExpectation()
  }

  public async matButtonText(id: string): Promise<string> {
    const matButton = await this.locatorFor(MatButtonHarness.with({
      selector: `${this.getIdSelector(id)}`
    }))()
    const matButtonIcon = await matButton.getHarnessOrNull(MatIconHarness)
    const matButtonText = await matButton.getText()
    const matButtonIconText = await matButtonIcon?.getName() || ''
    return matButtonText.replace(matButtonIconText, '').trim()
  }

  public async elementChildCount(id: string): Promise<number> {
    const supportedTags = [
      'div',
      'mat-dialog-actions'
    ]
    // we need to retrieve the parent first to make sure it exists
    const cssSelectorParent = this.getCssSelector(id, supportedTags, this.ancestorSelector)
    await this.locatorFor(cssSelectorParent)()
    const cssSelectorChildren = this.getCssSelector(id, supportedTags, this.ancestorSelector, ' > *')
    const children = await this.locatorForAll(cssSelectorChildren)()
    return children.length
  }

  // +
  public async expectButtonEnabled(id: string, enabled: boolean): Promise<void> {
    const cssSelector = `button${this.getIdSelector(id)}`
    await this.waitFor({
      lookup: async () => {
        const button = await this.locatorFor(cssSelector)()
        return await button.getProperty('disabled') === !enabled
      },
      errorMessage: `No ${enabled ? 'enabled' : 'disabled'} element for selector ${cssSelector} found`
    })
    this.markAssertionAsValidExpectation()
  }

  // +
  public async expectInputValue(id: string, value: string): Promise<void> {
    const cssSelector = this.getCssSelector(id, [
      'input',
      'textarea'
    ])

    await this.waitFor({
      lookup: async () => {
        const input = await this.locatorFor(cssSelector)()
        return await input.getProperty('value') === value
      },
      errorMessage: `No element for selector ${cssSelector} with value '${value}' found`
    })
    this.markAssertionAsValidExpectation()
  }

  public async matTableNRows(id: string): Promise<number> {
    const matTable = await this.locatorFor(MatTableHarness.with({
      selector: this.getIdSelector(id)
    }))()
    const rows = await matTable.getRows()
    return rows.length
  }

  public async matDialogPresent(dialogId: string): Promise<boolean> {
    const matDialog = await this.getRootLoader().getHarnessOrNull(MatDialogHarness.with({
      selector: `#${dialogId}`
    }))
    return !!matDialog
  }

  // +
  public async messageBoxPresent(type: MessageType, message?: string): Promise<boolean> {
    const messageBox = await this.getRootLoader().getHarnessOrNull(MatDialogHarness.with({
      selector: `#${type}MessageBox`
    }).addOption('message', message, async (harness, message): Promise<boolean> => {
      const actualMessage = await harness.getContentText()
      return actualMessage === message
    }))
    return !!messageBox
  }
}
