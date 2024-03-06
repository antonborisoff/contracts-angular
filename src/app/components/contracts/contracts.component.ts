import {
  Component
} from '@angular/core'
import {
  Translation,
  TranslocoPipe,
  TranslocoService,
  provideTranslocoScope
} from '@ngneat/transloco'
import {
  getTranslocoInlineLoader
} from '../../../transloco/transloco-loaders'
import {
  Contract
} from '../../interfaces/contract'
import {
  CommonModule
} from '@angular/common'
import {
  ContractService
} from '../../services/contracts/contract.service'
import {
  BackendErrorHandlerService
} from '../../services/backend-error-handler/backend-error-handler.service'
import {
  MessageBoxService
} from '../../services/message-box/message-box.service'
import {
  Router
} from '@angular/router'

const COMPONENT_TRANSLOCO_SCOPE = 'contracts'
@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [
    TranslocoPipe,
    CommonModule
  ],
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.css',
  providers: [provideTranslocoScope({
    scope: COMPONENT_TRANSLOCO_SCOPE,
    loader: getTranslocoInlineLoader((lang: string) => (): Promise<Translation> => import(`./i18n/${lang}.json`))
  })]
})
export class ContractsComponent {
  public static getTranslocoScope(): string {
    return COMPONENT_TRANSLOCO_SCOPE
  }

  public contracts: Contract[] = []
  public constructor(
    private contracts$: ContractService,
    private backendErrorHandler: BackendErrorHandlerService,
    private router: Router,
    private mb: MessageBoxService,
    private ts: TranslocoService
  ) {
    this.loadContracts()
  }

  public loadContracts(): void {
    this.contracts$.getContracts().subscribe({
      next: (contracts) => {
        this.contracts = contracts
      },
      error: () => this.backendErrorHandler.handleError()
    })
  }

  public deleteContract(id: string): void {
    this.mb.confirm(this.ts.translate('CONFIRM_DELETE_MESSAGE'), (confirmed) => {
      if (confirmed) {
        this.contracts$.deleteContract(id).subscribe({
          next: () => this.loadContracts(),
          error: () => this.backendErrorHandler.handleError()
        })
      }
    })
  }

  public addContract(): void {
    this.router.navigate(['/contract'])
  }
}
