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
  private endpointPath = '/api/auth'
  private AUTH_TOKEN_LOCAL_STORAGE_KEY = 'AuthTokenContractManagement'
  private isAuthSubject: BehaviorSubject<boolean> = new BehaviorSubject(!!this.getAuthToken())
  private isAuthObservable: Observable<boolean> = this.isAuthSubject.asObservable()

  public constructor(
    private http: HttpClient,
    private ft: FeatureToggleService
  ) { }

  public login(login: string, password: string): Observable<void> {
    return this.http.post<LoginReturnValue>(`${this.endpointPath}/login`, {
      login: login,
      password: password
    }).pipe(
      tap((res) => {
        localStorage.setItem(this.AUTH_TOKEN_LOCAL_STORAGE_KEY, res.token)
        this.ft.init(res.activeFeatures)
        this.isAuthSubject.next(!!this.getAuthToken())
      }),
      map(() => void 0)
    )
  }

  public logout(): Observable<void> {
    return this.http.post<void>(`${this.endpointPath}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem(this.AUTH_TOKEN_LOCAL_STORAGE_KEY)
        this.ft.cleanup()
        this.isAuthSubject.next(!!this.getAuthToken())
      })
    )
  }

  public isAuth(): Observable<boolean> {
    return this.isAuthObservable
  }

  public getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_LOCAL_STORAGE_KEY) || null
  }
}
