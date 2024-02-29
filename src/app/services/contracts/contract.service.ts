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
  public constructor(private http: HttpClient) { }

  public getContracts(): Observable<Contract[]> {
    return this.http.get<Contract[]>('/api/contracts')
  }
}
