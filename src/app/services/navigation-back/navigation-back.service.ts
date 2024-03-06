import {
  Injectable,
  OnDestroy
} from '@angular/core'
import {
  NavigationEnd,
  Router
} from '@angular/router'
import {
  Subscription
} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class NavigationBackService implements OnDestroy {
  private history: string[] = []
  private routerEventSubscription: Subscription

  public constructor(
    private router: Router
  ) {
    this.routerEventSubscription = this.router.events.subscribe((event) => {
      // ignore url if it is the same as the last one in history
      // since it means that back() method was called and navigation target is already present in history
      if (event instanceof NavigationEnd && this.history.slice(-1)[0] !== event.urlAfterRedirects) {
        this.history.push(event.urlAfterRedirects)
      }
    })
  }

  public async back(): Promise<void> {
    let urlToNavigateTo = '/'
    // remove the last target since it is the activated one
    // and we don't want to add it to navigation history so that we could go back further:
    // (a -> b -> c) + back() => a -> b
    // (a -> b) + back() => a
    this.history.pop()
    if (this.history.length) {
      urlToNavigateTo = this.history[this.history.length - 1]
    }
    // we don't use Location since Location service has integration issues with Router in tests;
    /***
     * Additional sync is required when Location service is used together with Router in unit tests;
     *
     * Location service is supposed to update router state (url, etc.);
     * Router subscribes to Location service changes in router.initialNavigation();
     * STEP 1: We have to call this method manually in unit tests to make sure the subscription happens
     *
     * SpyLocation used by RouterTestingModule provides all necessary tools for router to subscribe
     * and emits proper events to its subscriptions;
     * The problem is that Location.back does not provide means to wait for navigation completion it triggers,
     * so router assertions are evaluated prematurely;
     * STEP 2: use additional stabilization after Location.back() and similar methods: e.g. await sleep(0);
     */
    await this.router.navigate([urlToNavigateTo])
  }

  public ngOnDestroy(): void {
    this.routerEventSubscription.unsubscribe()
  }
}
