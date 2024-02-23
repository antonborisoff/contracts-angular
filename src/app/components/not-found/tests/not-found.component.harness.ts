import {
  ComponentHarness,
  TestElement
} from '@angular/cdk/testing'

export class NotFoundHarness extends ComponentHarness {
  public static hostSelector = 'app-not-found'

  private async getP(id: string, optional: boolean = false): Promise<TestElement | null> {
    return await this[optional ? 'locatorForOptional' : 'locatorFor'](`p[data-id="${id}"]`)()
  }

  private async getLink(id: string, optional: boolean = false): Promise<TestElement | null> {
    return await this[optional ? 'locatorForOptional' : 'locatorFor'](`a[data-id="${id}"]`)()
  }

  public async controlPresent(id: string): Promise<boolean> {
    return !!(await this.getP(id))
  }

  public async clickLink(id: string): Promise<void> {
    const link = await this.getLink(id, false)
    await link?.click()
  }
}
