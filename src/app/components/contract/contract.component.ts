import {
  Component,
  OnDestroy
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
  ReactiveFormsModule,
  Validators
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
import {
  ActivatedRoute
} from '@angular/router'
import {
  Observable,
  Subscription,
  map,
  of,
  switchMap
} from 'rxjs'
import {
  Contract
} from '../../interfaces/contract'
import {
  MatButtonModule
} from '@angular/material/button'
import {
  MatCardModule
} from '@angular/material/card'
import {
  MatInputModule
} from '@angular/material/input'

const COMPONENT_TRANSLOCO_SCOPE = 'contract'
@Component({
  selector: 'app-contract',
  standalone: true,
  imports: [
    TranslocoPipe,
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule
  ],
  templateUrl: './contract.component.html',
  styleUrl: './contract.component.css',
  providers: [provideTranslocoScope({
    scope: COMPONENT_TRANSLOCO_SCOPE,
    loader: getTranslocoInlineLoader((lang: string) => (): Promise<Translation> => import(`./i18n/${lang}.json`))
  })]
})
export class ContractComponent implements OnDestroy {
  public static getTranslocoScope(): string {
    return COMPONENT_TRANSLOCO_SCOPE
  }

  public contractForm

  private newContract: Contract = {
    id: '',
    number: '',
    conditions: ''
  }

  private contractId = ''

  private activatedRouteSubscription: Subscription

  public constructor(
    private contracts$: ContractService,
    private ar: ActivatedRoute,
    private backendErrorHandler: BackendErrorHandlerService,
    private fb: FormBuilder,
    private nb: NavigationBackService
  ) {
    this.contractForm = this.fb.nonNullable.group({
      number: [
        this.newContract.number,
        [
          Validators.required,
          requiredAfterTrimValidator()
        ]
      ],
      conditions: [
        this.newContract.conditions,
        [
          Validators.required,
          requiredAfterTrimValidator()
        ]
      ]
    }, {
      updateOn: 'blur'
    })

    this.activatedRouteSubscription = this.ar.queryParamMap.pipe(
      switchMap((queryParamMap): Observable<Contract> => {
        const contractId = queryParamMap.get('contractId')
        this.contractId = contractId || ''
        if (contractId) {
          return this.contracts$.getContract(contractId).pipe(
            this.backendErrorHandler.processError({
              v2: true
            })
          )
        }
        else {
          return of(this.newContract)
        }
      })
    ).subscribe((contract) => {
      this.contractForm.patchValue(contract)
    })
  }

  public onSave(): void {
    const externalizedContract = {
      number: this.contractForm.controls.number.value,
      conditions: this.contractForm.controls.conditions.value
    }
    let action
    if (this.contractId) {
      action = this.contracts$.updateContract(this.contractId, externalizedContract)
    }
    else {
      action = this.contracts$.createContract(externalizedContract).pipe(map(() => void 0))
    }
    action.pipe(
      this.backendErrorHandler.processError({
        v2: true
      })
    ).subscribe(() => {
      this.nb.back()
    })
  }

  public onCancelCreate(): void {
    this.nb.back()
  }

  public ngOnDestroy(): void {
    this.activatedRouteSubscription.unsubscribe()
  }
}
