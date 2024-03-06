import {
  HttpClient
} from '@angular/common/http'
import {
  Injectable
} from '@angular/core'
import {
  Observable,
  map
} from 'rxjs'
import {
  Contract
} from '../../interfaces/contract'
import {
  FeatureToggleService
} from '../features/feature-toggle.service'

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private endpointPath = '/api/contracts'
  public constructor(
    private ft: FeatureToggleService,
    private http: HttpClient
  ) {}

  public getContracts(): Observable<Contract[]> {
    this.ft.throwIfInactive('FT_Contracts')
    return this.http.get<Contract[]>(this.endpointPath)
  }

  public getContract(id: string): Observable<Contract> {
    this.ft.throwIfInactive('FT_Contracts')
    return this.http.get<Contract>(`${this.endpointPath}/${id}`)
  }

  public deleteContract(id: string): Observable<void> {
    this.ft.throwIfInactive('FT_Contracts')
    return this.http.delete<void>(`${this.endpointPath}/${id}`)
  }

  public createContract(contract: Omit<Contract, 'id'>): Observable<string> {
    this.ft.throwIfInactive('FT_Contracts')
    return this.http.post<{ id: string }>(`${this.endpointPath}`, contract).pipe(
      map(x => x.id)
    )
  }

  public updateContract(id: string, contract: Omit<Contract, 'id'>): Observable<void> {
    this.ft.throwIfInactive('FT_Contracts')
    return this.http.put<void>(`${this.endpointPath}/${id}`, contract)
  }
}
