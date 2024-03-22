import {
  MatButtonHarness
} from '@angular/material/button/testing'
import {
  BaseHarness
} from './foundation/base.component.harness'
import {
  MatIconHarness
} from '@angular/material/icon/testing'

export class AppHarness extends BaseHarness {
  public static hostSelector = 'app-root'

  public async expectMatButtonText(id: string, buttonText: string): Promise<void> {
    await this.waitFor({
      lookup: async () => {
        const matButton = await this.locatorFor(MatButtonHarness.with({
          selector: `${this.getIdSelector(id)}`
        }))()
        const matButtonIcon = await matButton.getHarnessOrNull(MatIconHarness)
        const matButtonText = await matButton.getText()
        const matButtonIconText = await matButtonIcon?.getName() || ''
        return matButtonText.replace(matButtonIconText, '').trim() === buttonText
      },
      errorMessage: `No mat button ${id} with text '${buttonText}' found`
    })
  }
}
