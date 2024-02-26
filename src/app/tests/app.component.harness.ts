import {
  TestElement
} from '@angular/cdk/testing'
import {
  BaseHarness
} from './foundation/base.component.harness'

export class AppHarness extends BaseHarness {
  public static hostSelector = 'app-root'

  private async getH1(id: string, optional: boolean = false): Promise<TestElement | null> {
    return await this[optional ? 'locatorForOptional' : 'locatorFor'](`h1[data-id="${id}"]`)()
  }

  public async controlText(id: string): Promise<string> {
    const text = await this.getH1(id)
    return await text?.text() || ''
  }

  public async controlPresent(id: string): Promise<boolean> {
    return !!(await this.locatorForOptional(`h1[data-id="${id}"],button[data-id="${id}"]`)())
  }
}
