import {
  Component
} from '@angular/core'
import {
  Translation,
  TranslocoPipe,
  provideTranslocoScope
} from '@ngneat/transloco'
import {
  getTranslocoInlineLoader
} from '../../../transloco/transloco-loaders'
import {
  CommonModule
} from '@angular/common'
import {
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'
import {
  requiredAfterTrimValidator
} from '../../validators'
import {
  ContractService
} from '../../services/contracts/contract.service'
import {
  BackendErrorHandlerService
} from '../../services/backend-error-handler/backend-error-handler.service'
import {
  NavigationBackService
} from '../../services/navigation-back/navigation-back.service'

const COMPONENT_TRANSLOCO_SCOPE = 'contract'
@Component({
  selector: 'app-contract',
  standalone: true,
  imports: [
    TranslocoPipe,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './contract.component.html',
  styleUrl: './contract.component.css',
  providers: [provideTranslocoScope({
    scope: COMPONENT_TRANSLOCO_SCOPE,
    loader: getTranslocoInlineLoader((lang: string) => (): Promise<Translation> => import(`./i18n/${lang}.json`))
  })]
})
export class ContractComponent {
  public static getTranslocoScope(): string {
    return COMPONENT_TRANSLOCO_SCOPE
  }

  public contractForm
  public constructor(
    private backendErrorHandler: BackendErrorHandlerService,
    private fb: FormBuilder,
    private contracts$: ContractService,
    private nb: NavigationBackService
  ) {
    this.contractForm = this.fb.nonNullable.group({
      number: [
        '',
        [requiredAfterTrimValidator()]
      ],
      conditions: [
        '',
        [requiredAfterTrimValidator()]
      ]
    }, {
      updateOn: 'blur'
    })
  }

  public onCreate(): void {
    this.contracts$.createContract({
      number: this.contractForm.controls.number.value,
      conditions: this.contractForm.controls.conditions.value
    }).subscribe({
      next: () => {
        this.nb.back()
      },
      error: () => this.backendErrorHandler.handleError()
    })
  }

  public onCancelCreate(): void {
    this.nb.back()
  }
}
