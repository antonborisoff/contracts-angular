import {
  Component
} from '@angular/core'
import {
  BusyDirective
} from '../busy.directive'
import {
  BaseHarness
} from '../../../tests/foundation/base.component.harness'

@Component({
  selector: 'app-test-app-busy-directive',
  standalone: true,
  imports: [BusyDirective],
  template: `
    <div data-id="test-element-a" appBusy="busy-element"></div>
    <div data-id="test-element-b" appBusy="not-busy-element"></div>
    `
})
export class TestComponent {}

export class TestComponentHarness extends BaseHarness {
  public static hostSelector: 'app-test-app-busy-directive'

  public async expectElementBusy(id: string, busy: boolean): Promise<void> {
    await this.waitFor({
      lookup: async () => {
        const busyOverlay = await this.locatorForOptional(`div${this.getIdSelector(id)} div${this.getIdSelector('app-busy-overlay')}`)()
        return !!busyOverlay === busy
      },
      errorMessage: `No ${busy ? 'busy' : 'free'} element ${id} found`
    })
    this.markAssertionAsValidExpectation()
  }
}
