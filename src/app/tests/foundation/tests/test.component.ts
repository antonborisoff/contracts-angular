import {
  Component
} from '@angular/core'

@Component({
  selector: 'app-test-component',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html'
})
export class TestComponent {
  private clickedElements: Record<string, boolean> = {}

  public clickElement(buttonId: string): void {
    this.clickedElements[buttonId] = true
  }

  public isElementClicked(buttonId: string): boolean {
    return !!this.clickedElements[buttonId]
  }
}
