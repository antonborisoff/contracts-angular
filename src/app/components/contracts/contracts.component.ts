import {
  AfterViewInit,
  Component,
  ViewChild
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
import {
  MatToolbarModule
} from '@angular/material/toolbar'
import {
  MatButtonModule
} from '@angular/material/button'
import {
  MatIconModule
} from '@angular/material/icon'
import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table'
import {
  MatTooltipModule
} from '@angular/material/tooltip'
import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator'

const COMPONENT_TRANSLOCO_SCOPE = 'contracts'
@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [
    TranslocoPipe,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule
  ],
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.css',
  providers: [provideTranslocoScope({
    scope: COMPONENT_TRANSLOCO_SCOPE,
    loader: getTranslocoInlineLoader((lang: string) => (): Promise<Translation> => import(`./i18n/${lang}.json`))
  })]
})
export class ContractsComponent implements AfterViewInit {
  public static getTranslocoScope(): string {
    return COMPONENT_TRANSLOCO_SCOPE
  }

  public pageSizeOptions = [
    5,
    10,
    20
  ]

  @ViewChild(MatPaginator) private paginator?: MatPaginator
  public contractDataSource: MatTableDataSource<Contract> = new MatTableDataSource<Contract>([])
  public displayedColumns = [
    'number',
    'conditions',
    'id'
  ]

  public constructor(
    private contracts$: ContractService,
    private backendErrorHandler: BackendErrorHandlerService,
    private router: Router,
    private mb: MessageBoxService,
    private ts: TranslocoService
  ) {
    this.loadContracts()
  }

  public ngAfterViewInit(): void {
    if (this.paginator) {
      this.contractDataSource.paginator = this.paginator
    }
  }

  public trackContract(index: number, contract: Contract): string {
    return contract.id
  }

  public loadContracts(): void {
    this.contracts$.getContracts().pipe(this.backendErrorHandler.processError()).subscribe((contracts) => {
      this.contractDataSource.data = contracts
    })
  }

  public deleteContract(id: string): void {
    this.mb.confirm(this.ts.translate('CONFIRM_DELETE_MESSAGE'), (confirmed) => {
      if (confirmed) {
        this.contracts$.deleteContract(id).pipe(this.backendErrorHandler.processError()).subscribe(() => {
          this.loadContracts()
        })
      }
    })
  }

  public addContract(): void {
    this.router.navigate(['/contract'])
  }

  public editContract(id: string): void {
    this.router.navigate(['/contract'], {
      queryParams: {
        contractId: id
      }
    })
  }
}
