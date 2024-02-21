import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms'

export function requiredAfterTrimValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const invalid = !control.value?.trim()
    return invalid
      ? {
          requiredAfterTrim: {
            value: control.value
          }
        }
      : null
  }
}
