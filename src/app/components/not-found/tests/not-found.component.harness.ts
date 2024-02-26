import {
  TestElement
} from '@angular/cdk/testing'
import {
  BaseHarness
} from '../../../tests/foundation/base.component.harness'

export class NotFoundHarness extends BaseHarness {
  public static hostSelector = 'app-not-found'

  private async getP(id: string, optional: boolean = false): Promise<TestElement | null> {
    return await this[optional ? 'locatorForOptional' : 'locatorFor'](`p[data-id="${id}"]`)()
  }

  public async controlPresent(id: string): Promise<boolean> {
    return !!(await this.getP(id))
  }
}
