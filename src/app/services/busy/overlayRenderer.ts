import {
  ElementRef,
  Injectable,
  Renderer2
} from '@angular/core'

// not root since a new instance must be provided to each new directive instance
// to get correct renderer and element ref
@Injectable()
export class OverlayRenderer {
  private hostElement: HTMLElement

  private overlayDataId = 'app-busy-overlay'
  private OVERLAY_CLASS = 'app-busy-overlay'
  private OVERLAY_SPINNER_CLASS = 'app-busy-overlay-spinner'
  private overlayElement: HTMLElement | undefined
  private overlayPresent = false

  public constructor(
    private hostRenderer: Renderer2,
    private elementRef: ElementRef
  ) {
    this.hostElement = this.elementRef.nativeElement
    // required to make sure busy indicator overlay is limited to host element;
    // 'host' property in Directive doesn't work
    this.hostElement.style.position = 'relative'
    this.initOverlayElement()
  }

  private initOverlayElement(): void {
    this.overlayElement = this.hostRenderer.createElement('div')
    // disable click event bubbling to the host element thus disabling interaction with it
    this.hostRenderer.listen(this.overlayElement, 'click', function (event): void {
      event.stopPropagation()
    })
    this.hostRenderer.addClass(this.overlayElement, this.OVERLAY_CLASS)
    this.hostRenderer.setAttribute(this.overlayElement, 'data-id', this.overlayDataId)

    const spinnerElement = this.hostRenderer.createElement('div')
    this.hostRenderer.addClass(spinnerElement, this.OVERLAY_SPINNER_CLASS)
    for (let i = 0; i < 4; i++) {
      this.hostRenderer.appendChild(spinnerElement, this.hostRenderer.createElement('div'))
    }

    this.hostRenderer.appendChild(this.overlayElement, spinnerElement)
  }

  public setOverlay(): void {
    if (!this.overlayPresent) {
      this.hostRenderer.appendChild(this.hostElement, this.overlayElement)
    }
    this.overlayPresent = true
  }

  public removeOverlay(): void {
    if (this.overlayPresent) {
      this.hostRenderer.removeChild(this.hostElement, this.overlayElement)
    }
    this.overlayPresent = false
  }
}
