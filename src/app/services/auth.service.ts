import {
  Injectable
} from '@angular/core'
import {
  Observable,
  of
} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public constructor() { }

  public login(login: string, password: string): Observable<void> {
    console.log(login + ' ' + password)
    return of()
  }
}
