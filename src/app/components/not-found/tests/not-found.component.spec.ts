import {
  NotFoundComponent
} from '../not-found.component'
import {
  NotFoundHarness
} from './not-found.component.harness'
import en from '../i18n/en.json'
import {
  ComponentHarnessAndUtils,
  initComponentBase
} from '../../../tests/utils'

describe('NotFoundComponent', () => {
  async function initComponent(): ComponentHarnessAndUtils<NotFoundHarness> {
    return initComponentBase(NotFoundComponent, NotFoundHarness, en)
  }

  it('display "not found" message', async () => {
    const {
      harnesses
    } = await initComponent()

    expect(await harnesses.router.component.elementVisible('notFoundMessage')).toBe(true)
  })
})
