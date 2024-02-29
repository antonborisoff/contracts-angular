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
  private clickedElements: Record<string, boolean> = {}
  public formControlUpdateOnChange = this.fb.nonNullable.control<string>('')
  public formControlUpdateOnBlur = this.fb.nonNullable.control<string>('', {
    updateOn: 'blur'
  })

  public constructor(private fb: FormBuilder) {}

  public clickElement(buttonId: string): void {
    this.clickedElements[buttonId] = true
  }

  public isElementClicked(buttonId: string): boolean {
    return !!this.clickedElements[buttonId]
  }
}
