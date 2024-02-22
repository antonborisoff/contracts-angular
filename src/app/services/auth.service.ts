import {
  HttpClient
} from '@angular/common/http'
import {
  Injectable
} from '@angular/core'
import {
  Observable
} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public constructor(private http: HttpClient) { }

  public login(login: string, password: string): Observable<void> {
    return this.http.post<void>('/auth/login', {
      login: login,
      password: password
    })
  }
}
