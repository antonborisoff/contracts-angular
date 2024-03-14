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
import {
  MessageBoxService
} from '../../../services/message-box/message-box.service'

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
  public static getTranslocoScope(): string {
    return ''
  }

  private clickedElements: Record<string, string> = {}
  public formControlInputUpdateOnChange = this.fb.nonNullable.control<string>('')
  public formControlInputUpdateOnBlur = this.fb.nonNullable.control<string>('', {
    updateOn: 'blur'
  })

  public formControlTextareaUpdateOnChange = this.fb.nonNullable.control<string>('')
  public formControlTextareaUpdateOnBlur = this.fb.nonNullable.control<string>('', {
    updateOn: 'blur'
  })

  public messageBoxConfirmed = false

  public constructor(
    private fb: FormBuilder,
    private mb: MessageBoxService
  ) {}

  public clickElement(target: EventTarget | null): void {
    const elementId = (target as HTMLElement).dataset['id'] as string
    const elementText = (target as HTMLElement).textContent as string
    this.clickedElements[elementId] = elementText
  }

  public getElementClicked(buttonId: string): string | undefined {
    return this.clickedElements[buttonId]
  }

  public onError2(): void {
    this.mb.error2('message box error2')
  }
}
