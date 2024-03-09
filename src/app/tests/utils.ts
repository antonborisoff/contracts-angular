import {
  HttpErrorResponse
} from '@angular/common/http'
import {
  Component
} from '@angular/core'
import {
  Route
} from '@angular/router'
import {
  Observable,
  throwError
} from 'rxjs'

@Component({
  standalone: true,
  selector: 'app-test',
  template: '<div></div>'
})
export class TestComponent {}

export function stubRouteComponents(routes: Route[]): Route[] {
  return routes.map((route: Route) => {
    if (route.component) {
      route.component = TestComponent
    }
    return route
  })
}

export function throwGeneralError(): Observable<never> {
  return throwError(() => {
    return new Error('general error message')
  })
}
export function throwBackendError(status: number = 500): Observable<never> {
  return throwError(() => {
    return new HttpErrorResponse({
      status: status
    })
  })
}
