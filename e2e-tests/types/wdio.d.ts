// export {} is needed to mark file as module
export {}
declare global {
  namespace WebdriverIO {
    interface Browser {
      isFeatureActive: (feature: string) => Promise<boolean>
    }
  }
}
