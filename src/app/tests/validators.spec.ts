import {
  FormControl
} from '@angular/forms'
import {
  requiredAfterTrimValidator
} from '../validators'

describe('Validators', () => {
  it('requiredAfterTrim', async () => {
    const input = new FormControl<string>('valid value', [requiredAfterTrimValidator()])

    expect(input.valid).toBe(true)
    expect(input.errors?.['requiredAfterTrim']).toBeUndefined()

    input.setValue('')
    expect(input.valid).toBe(false)
    expect(input.errors?.['requiredAfterTrim']).toEqual(jasmine.objectContaining({
      value: ''
    }))

    input.setValue('valid value')
    expect(input.valid).toBe(true)
    expect(input.errors?.['requiredAfterTrim']).toBeUndefined()

    input.setValue(' ')
    expect(input.valid).toBe(false)
    expect(input.errors?.['requiredAfterTrim']).toEqual(jasmine.objectContaining({
      value: ' '
    }))
  })
})
