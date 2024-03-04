import {
  HttpClient
} from '@angular/common/http'
import {
  Injectable
} from '@angular/core'
import {
  Observable
} from 'rxjs'
import {
  Contract
} from '../../interfaces/contract'

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private endpointPath = '/api/contracts'
  public constructor(private http: HttpClient) { }

  public getContracts(): Observable<Contract[]> {
    return this.http.get<Contract[]>(this.endpointPath)
  }

  public deleteContract(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpointPath}/${id}`)
  }
}
