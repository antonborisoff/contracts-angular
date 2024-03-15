import {
  Injectable
} from '@angular/core'
import {
  BehaviorSubject,
  MonoTypeOperatorFunction,
  Observable,
  defer,
  distinctUntilChanged,
  finalize
} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class BusyStateService {
  private busyState: Map<string, BehaviorSubject<boolean>> = new Map()
  private busyStateObservables: Map<string, Observable<boolean>> = new Map()

  private initBusyState(key: string): void {
    const keyBusyState = new BehaviorSubject(false)
    const keyBusyStateObservable = keyBusyState.asObservable()
    this.busyState.set(key, keyBusyState)
    this.busyStateObservables.set(key, keyBusyStateObservable)
  }

  private setBusy(key: string, busy: boolean): void {
    if (!this.busyState.get(key)) {
      this.initBusyState(key)
    }
    // non-null assertion since we called init beforehand
    this.busyState.get(key)!.next(busy)
  }

  public getBusyState(key: string): Observable<boolean> {
    if (!this.busyState.get(key)) {
      this.initBusyState(key)
    }
    // non-null assertion since we called init beforehand
    return this.busyStateObservables.get(key)!.pipe(distinctUntilChanged())
  }

  public processLoading<T>(key: string): MonoTypeOperatorFunction<T> {
    const setBusy = this.setBusy.bind(this)
    return function<T>(source: Observable<T>): Observable<T> {
      return defer(() => {
        setBusy(key, true)
        return source
      }).pipe(
        finalize(() => {
          setBusy(key, false)
        })
      )
    }
  }
}
