import {
  HttpClient
} from '@angular/common/http'
import {
  Injectable
} from '@angular/core'
import {
  BehaviorSubject,
  Observable,
  map,
  tap
} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthSubject: BehaviorSubject<boolean> = new BehaviorSubject(false)
  private isAuthObservable: Observable<boolean> = this.isAuthSubject.asObservable()
  private authToken: string | null = null

  public constructor(private http: HttpClient) { }

  public login(login: string, password: string): Observable<void> {
    return this.http.post<{ token: string }>('/api/auth/login', {
      login: login,
      password: password
    }).pipe(
      tap((res) => {
        this.authToken = res.token
        this.isAuthSubject.next(true)
      }),
      map(() => void 0)
    )
  }

  public logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      tap(() => {
        this.authToken = null
        this.isAuthSubject.next(false)
      })
    )
  }

  public isAuth(): Observable<boolean> {
    return this.isAuthObservable
  }

  public getAuthToken(): string | null {
    return this.authToken
  }
}
