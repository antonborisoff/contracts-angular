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
  ) {
    if (!this.ft.isActive('FT_Contracts')) {
      throw new Error('Feature is inactive')
    }
  }

  public getContracts(): Observable<Contract[]> {
    return this.http.get<Contract[]>(this.endpointPath)
  }

  public deleteContract(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpointPath}/${id}`)
  }

  public createContract(contract: Omit<Contract, 'id'>): Observable<string> {
    return this.http.post<{ id: string }>(`${this.endpointPath}`, contract).pipe(
      map(x => x.id)
    )
  }
}
