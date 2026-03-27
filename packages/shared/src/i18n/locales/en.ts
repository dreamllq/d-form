import type { LocaleMessages } from '../types'

export const en: LocaleMessages = {
  validation: {
    required: '{field} is required',
    minLength: '{field} must be at least {min} characters',
    maxLength: '{field} must be at most {max} characters',
    pattern: '{field} format is invalid',
    email: '{field} must be a valid email',
    min: '{field} must be at least {min}',
    max: '{field} must be at most {max}'
  },
  form: {
    submit: 'Submit',
    reset: 'Reset',
    cancel: 'Cancel'
  }
}
