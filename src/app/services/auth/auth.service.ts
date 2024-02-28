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
import {
  FeatureToggleService
} from '../features/feature-toggle.service'

interface LoginReturnValue {
  token: string
  activeFeatures: string[]
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthSubject: BehaviorSubject<boolean> = new BehaviorSubject(false)
  private isAuthObservable: Observable<boolean> = this.isAuthSubject.asObservable()
  private authToken: string | null = null

  public constructor(
    private http: HttpClient,
    private ft: FeatureToggleService
  ) { }

  public login(login: string, password: string): Observable<void> {
    return this.http.post<LoginReturnValue>('/api/auth/login', {
      login: login,
      password: password
    }).pipe(
      tap((res) => {
        this.authToken = res.token
        this.ft.init(res.activeFeatures)
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
