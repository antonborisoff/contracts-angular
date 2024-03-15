import {
  Directive,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core'
import {
  BusyStateService
} from './busy-state.service'
import {
  Subscription
} from 'rxjs'
import {
  OverlayRenderer
} from './overlayRenderer'

@Directive({
  selector: '[appBusy]',
  standalone: true,
  providers: [OverlayRenderer]
})
export class BusyDirective implements OnChanges, OnDestroy {
  @Input({
    alias: 'appBusy',
    required: true
  }) public key: string = ''

  private busySubscription: Subscription | undefined

  public constructor(
    private overlayRenderer: OverlayRenderer,
    private busyStateService: BusyStateService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['key'].isFirstChange()) {
      this.busySubscription = this.busyStateService.getBusyState(this.key).subscribe((busy) => {
        if (busy) {
          this.overlayRenderer.setOverlay()
        }
        else {
          this.overlayRenderer.removeOverlay()
        }
      })
    }
  }

  public ngOnDestroy(): void {
    this.busySubscription?.unsubscribe()
  }
}
