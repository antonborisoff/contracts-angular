import {
  Injectable
} from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class FeatureToggleService {
  private ACTIVE_FEATURES_LOCAL_STORAGE_KEY = 'activeFeaturesContractsManagement'
  private initCompleted: boolean = !!this.getActiveFeatures().length

  private getActiveFeatures(): string[] {
    const activeFeatures: string | null = localStorage.getItem(this.ACTIVE_FEATURES_LOCAL_STORAGE_KEY)
    if (activeFeatures) {
      return JSON.parse(activeFeatures)
    }
    else {
      return []
    }
  }

  public init(activeFeatures: string[]): void {
    if (!this.initCompleted) {
      localStorage.setItem(this.ACTIVE_FEATURES_LOCAL_STORAGE_KEY, JSON.stringify(activeFeatures))
      this.initCompleted = true
    }
  }

  public cleanup(): void {
    localStorage.removeItem(this.ACTIVE_FEATURES_LOCAL_STORAGE_KEY)
    this.initCompleted = false
  }

  public isActive(feature: string): boolean {
    return this.getActiveFeatures().includes(feature)
  }
}
