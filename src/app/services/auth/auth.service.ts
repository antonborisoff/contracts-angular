import {
  HttpClient
} from '@angular/common/http'
import {
  Injectable
} from '@angular/core'
import {
  BehaviorSubject,
  Observable,
  tap
} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthSubject: BehaviorSubject<boolean> = new BehaviorSubject(false)
  private isAuthObservable: Observable<boolean> = this.isAuthSubject.asObservable()

  public constructor(private http: HttpClient) { }

  public login(login: string, password: string): Observable<void> {
    return this.http.post<void>('/api/auth/login', {
      login: login,
      password: password
    }).pipe(
      tap(() => {
        this.isAuthSubject.next(true)
      })
    )
  }

  public logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      tap(() => {
        this.isAuthSubject.next(false)
      })
    )
  }

  public isAuth(): Observable<boolean> {
    return this.isAuthObservable
  }
}
