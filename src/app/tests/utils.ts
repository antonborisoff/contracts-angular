import {
  Component
} from '@angular/core'
import {
  Route
} from '@angular/router'

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
