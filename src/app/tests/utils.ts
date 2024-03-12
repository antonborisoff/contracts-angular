import {
  ComponentHarnessConstructor
} from '@angular/cdk/testing'
import {
  HttpErrorResponse
} from '@angular/common/http'
import {
  Component,
  Type
} from '@angular/core'
import {
  TestBed
} from '@angular/core/testing'
import {
  Route
} from '@angular/router'
import {
  Observable,
  throwError
} from 'rxjs'
import {
  getTranslocoTestingModule
} from '../../transloco/transloco-testing'
import {
  TranslocoLocalScope
} from '../../transloco/transloco-interfaces'
import {
  Translation
} from '@ngneat/transloco'
import {
  RouterTestingHarness,
  RouterTestingModule
} from '@angular/router/testing'
import {
  TestbedHarnessEnvironment
} from '@angular/cdk/testing/testbed'
import {
  BaseHarness
} from './foundation/base.component.harness'
import {
  provideNoopAnimations
} from '@angular/platform-browser/animations'

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

class RouterTestingHarnessWithNavigationDetection<K extends BaseHarness> {
  private routerHarness: RouterTestingHarness
  private componentHarnessContrusctor: ComponentHarnessConstructor<K>
  private targetHarness: K | undefined

  public constructor(routerHarness: RouterTestingHarness, componentHarnessContrusctor: ComponentHarnessConstructor<K>) {
    this.routerHarness = routerHarness
    this.componentHarnessContrusctor = componentHarnessContrusctor
  }

  public async init(): Promise<void> {
    this.targetHarness = await this.retrieveTargetHarness()
  }

  public async navigateByUrl(url: string): Promise<NonNullable<unknown> | null> {
    const result = await this.routerHarness.navigateByUrl(url)
    /**
     * 1) If we use the same component for multiple routes, new component instances might be created for each route;
     * 2) When we retrieve a harness for a component, we really retrieve a harness INSTANCE for a component INSTANCE;
     * 3) considering 1 and 2 it might be the case that after navigation we need to interact with component instance different
     * from the one we have component harness instance for; It could be seen if we add unique public id to each component instance,
     * extrapolate it in the template and try to retrieve it with component harness instances; We get different values for
     * component harness instance retrieved BEFORE navigation and retrieved AFTER navigation;
     * This is why we need to manually maintain targetHarness for our test setup (see initComponentBase) and expose it via routerHarness since
     * ultimately component harness instance depends on whether router harness navigated somewhere or not;
    */
    this.targetHarness = await this.retrieveTargetHarness()
    return result
  }

  private async retrieveTargetHarness(): Promise<K> {
    const rootFixture = this.routerHarness.fixture
    const rootHarnessLoader = TestbedHarnessEnvironment.loader(rootFixture)
    return await rootHarnessLoader.getHarness(this.componentHarnessContrusctor)
  }

  public get component(): K {
    if (!this.targetHarness) {
      throw new Error('init() must be called before first retrieval of the component from RouterHarness')
    }
    return this.targetHarness
  }
}

export type ComponentHarnessAndUtils<K extends BaseHarness> = Promise<{
  harnesses: {
    router: RouterTestingHarnessWithNavigationDetection<K>
  }
}>

/* Angular uses Type<any> */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export async function initComponentBase<T extends Type<any>, K extends BaseHarness>(
  componentClass: T & TranslocoLocalScope,
  componentHarnessContrusctor: ComponentHarnessConstructor<K>,
  enTranslation: Translation,
  options?: {
    /* Angular uses any[] */
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    providers?: any[]
    routePaths?: string[]
    navigateAfterInitializationTo?: string
  }
): ComponentHarnessAndUtils<K> {
  const routes: Route[] = []
  // we need to use target component for all routes to make sure
  // injected services relying on Router.events are initialized at the same time as root component
  // created by RouterTestingHarness.create();
  // if we use TestComponent for initial route, it won't be the case and some history will be missing;
  // It might be possible to achieve the same by manually creating the dependency and providing it via useValue,
  // but the current approach seems more robust since we maintain fewer dependencies ourselves;
  routes.push({
    path: 'initial',
    component: componentClass
  })
  for (const routePath of options?.routePaths || []) {
    routes.push({
      path: routePath,
      component: componentClass
    })
  }

  await TestBed.configureTestingModule({
    imports: [
      componentClass,
      getTranslocoTestingModule(componentClass, enTranslation),
      RouterTestingModule.withRoutes(routes)
    ],
    providers: [provideNoopAnimations()].concat(options?.providers || [])
  }).compileComponents()

  const routerHarness = await RouterTestingHarness.create('/initial')
  if (options?.navigateAfterInitializationTo) {
    await routerHarness.navigateByUrl(options.navigateAfterInitializationTo)
  }
  const routerHarnessWithNavDetect = new RouterTestingHarnessWithNavigationDetection(routerHarness, componentHarnessContrusctor)
  await routerHarnessWithNavDetect.init()
  return {
    harnesses: {
      router: routerHarnessWithNavDetect
    }
  }
}
