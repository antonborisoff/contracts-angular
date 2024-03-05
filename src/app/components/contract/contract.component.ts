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
    private fb: FormBuilder
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

  }
}
