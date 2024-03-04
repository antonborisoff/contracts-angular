import {
  CommonModule
} from '@angular/common'
import {
  Component
} from '@angular/core'
import {
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'

@Component({
  selector: 'app-test-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent {
  private clickedElements: Record<string, string> = {}
  public formControlUpdateOnChange = this.fb.nonNullable.control<string>('')
  public formControlUpdateOnBlur = this.fb.nonNullable.control<string>('', {
    updateOn: 'blur'
  })

  public constructor(private fb: FormBuilder) {}

  public clickElement(target: EventTarget | null): void {
    const elementId = (target as HTMLElement).dataset['id'] as string
    const elementText = (target as HTMLElement).textContent as string
    this.clickedElements[elementId] = elementText
  }

  public getElementClicked(buttonId: string): string | undefined {
    return this.clickedElements[buttonId]
  }
}
