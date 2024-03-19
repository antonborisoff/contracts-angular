declare global {
  namespace WebdriverIO {
    interface Browser {
      isFeatureActive: (feature: string) => Promise<boolean>
    }
  }
}
