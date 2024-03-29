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
import {
  MatCardModule
} from '@angular/material/card'
import {
  MatFormFieldModule
} from '@angular/material/form-field'
import {
  MatIconModule
} from '@angular/material/icon'
import {
  MatToolbarModule
} from '@angular/material/toolbar'
import {
  BusyDirective
} from '../../../services/busy/busy.directive'
import {
  BehaviorSubject
} from 'rxjs'
import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog'
import {
  MatMenuModule
} from '@angular/material/menu'

@Component({
  selector: 'app-test-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatToolbarModule,
    MatDialogModule,
    MatMenuModule,
    BusyDirective
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

  public isPresent = new BehaviorSubject(false)

  public matMenuOptions = [
    {
      key: 'option_A',
      text: 'Option A'
    },
    {
      key: 'option_B',
      text: 'Option B'
    }
  ]

  public selectedMatMenuOption: string = ''

  public constructor(
    private fb: FormBuilder,
    private mb: MessageBoxService,
    private matDialog: MatDialog
  ) {}

  public clickElement(target: EventTarget | null): void {
    const elementId = (target as HTMLElement).dataset['id'] as string
    const elementText = (target as HTMLElement).textContent as string
    this.clickedElements[elementId] = elementText
  }

  public getElementClicked(buttonId: string): string | undefined {
    return this.clickedElements[buttonId]
  }

  public onError(): void {
    this.mb.error('message box error')
  }

  public onMatDialog(): void {
    this.matDialog.open(TestComponent, {
      id: 'testMatDialog'
    })
  }

  public matMenuItemSelected(matMenuItemKey: string): void {
    this.selectedMatMenuOption = matMenuItemKey
  }
}
