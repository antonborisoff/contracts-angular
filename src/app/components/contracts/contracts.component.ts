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
  MessageBoxService
} from '../../services/message-box/message-box.service'

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
    private translocoService: TranslocoService,
    private messageBox: MessageBoxService
  ) {
    this.contracts$.getContracts().subscribe({
      next: (contracts) => {
        this.contracts = contracts
      },
      error: () => {
        this.messageBox.error(this.translocoService.translate(`${COMPONENT_TRANSLOCO_SCOPE}.GENERAL_ERROR_MESSAGE`))
      }
    })
  }
}
