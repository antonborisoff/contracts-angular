import {
  Injectable
} from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class FeatureToggleService {
  private activeFeatures: string[] = []
  private initCompleted: boolean = false

  public init(activeFeatures: string[]): void {
    if (!this.initCompleted) {
      this.activeFeatures = activeFeatures
      this.initCompleted = true
    }
    else {
      throw new Error('Feature toggle service initialization already completed.')
    }
  }

  public isActive(feature: string): boolean {
    return this.activeFeatures.includes(feature)
  }
}
