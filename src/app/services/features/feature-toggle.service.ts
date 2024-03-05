import {
  Injectable
} from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class FeatureToggleService {
  private ACTIVE_FEATURES_LOCAL_STORAGE_KEY = 'activeFeaturesContractsManagement'
  private activeFeatures: string[] = this.getActiveFeatures()
  private initCompleted: boolean = this.isLocalStorageDataPresent()

  private isLocalStorageDataPresent(): boolean {
    return localStorage.getItem(this.ACTIVE_FEATURES_LOCAL_STORAGE_KEY) !== null
  }

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
      this.activeFeatures = activeFeatures
    }
  }

  public cleanup(): void {
    localStorage.removeItem(this.ACTIVE_FEATURES_LOCAL_STORAGE_KEY)
    this.initCompleted = false
    this.activeFeatures = []
  }

  // useful for components and templates
  public isActive(feature: string): boolean {
    return this.activeFeatures.includes(feature)
  }

  // useful for services
  public throwIfInactive(feature: string): void {
    if (!this.isActive(feature)) {
      throw new Error('feature inactive')
    }
  }
}
