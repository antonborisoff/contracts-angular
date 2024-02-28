import {
  inject
} from '@angular/core'
import {
  CanMatchFn
} from '@angular/router'
import {
  FeatureToggleService
} from '../services/features/feature-toggle.service'

export function featureCanMatchGuard(features: string[]): CanMatchFn {
  return () => {
    const ft = inject(FeatureToggleService)
    return features.every((feature) => {
      return ft.isActive(feature)
    })
  }
}
