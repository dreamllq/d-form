import type {
  FieldSchema,
  FieldState,
  FieldMeta,
  ValidationResult,
  ValidationRule,
  ValidationTrigger,
} from '@d-form/shared'
import { validateFieldAsync, validateFieldSync } from '../validation'

function matchesTrigger(rule: ValidationRule, trigger: ValidationTrigger): boolean {
  if (!rule.trigger) return true
  if (Array.isArray(rule.trigger)) return rule.trigger.includes(trigger)
  return rule.trigger === trigger
}

function filterRulesByTrigger(
  rules: ValidationRule[],
  trigger?: ValidationTrigger
): ValidationRule[] {
  if (!trigger) return rules
  return rules.filter((rule) => matchesTrigger(rule, trigger))
}

type Form = import('./form').Form

type FieldEvent = 'valueChange' | 'touchedChange' | 'stateChange'

export class Field {
  private _form: Form
  private _state: FieldState
  private _initialValue: any
  private _eventListeners: Map<string, Set<Function>> = new Map()

  readonly meta: FieldMeta

  constructor(form: Form, path: string, schema?: FieldSchema) {
    this._form = form

    const initialValue = this._form.getInitialValue(path) ?? schema?.default

    this._initialValue = initialValue
    this._state = {
      value: initialValue,
      touched: false,
      dirty: false,
      visible: schema?.visible ?? true,
      disabled: schema?.disabled ?? false,
      validating: false,
    }

    const parts = path.split('.')
    this.meta = {
      path,
      name: parts[parts.length - 1],
      schema: schema || { type: 'string' },
      depth: parts.length - 1,
    }

    if (parts.length > 1) {
      this.meta.parentPath = parts.slice(0, -1).join('.')
    }
  }

  getValue(): any {
    return this._state.value
  }

  setValue(value: any): void {
    const oldValue = this._state.value
    if (oldValue === value) return

    this._state.value = value

    const isDirty = value !== this._initialValue
    this._state.dirty = isDirty

    this._emit('valueChange', value, oldValue)
    this._emit('stateChange', this._state)

    this._form._notifyFieldValueChange(this.meta.path, value)

    this.validate('change')
  }

  getState(): FieldState {
    return { ...this._state }
  }

  setState(partial: Partial<FieldState>): void {
    Object.assign(this._state, partial)
    this._emit('stateChange', this._state)
  }

  getError(): string | undefined {
    return this._state.error
  }

  setError(error: string | undefined): void {
    this._state.error = error
    this._emit('stateChange', this._state)
  }

  setTouched(touched: boolean): void {
    const oldTouched = this._state.touched
    if (oldTouched === touched) return

    this._state.touched = touched
    this._emit('touchedChange', touched, oldTouched)
    this._emit('stateChange', this._state)

    if (touched) {
      this.validate('blur')
    }
  }

  setVisible(visible: boolean): void {
    this._state.visible = visible
    this._emit('stateChange', this._state)
  }

  setDisabled(disabled: boolean): void {
    this._state.disabled = disabled
    this._emit('stateChange', this._state)
  }

  reset(): void {
    this._state.value = this._initialValue
    this._state.touched = false
    this._state.dirty = false
    this._state.error = undefined
    this._state.validating = false
    this._emit('stateChange', this._state)
  }

  validate(trigger?: ValidationTrigger): ValidationResult | Promise<ValidationResult> {
    const allRules = this.meta.schema?.validation?.rules || []
    const fieldTrigger = this.meta.schema?.validation?.trigger

    if (trigger && fieldTrigger) {
      const matches = Array.isArray(fieldTrigger)
        ? fieldTrigger.includes(trigger)
        : fieldTrigger === trigger
      if (!matches) {
        return { valid: true, errors: [] }
      }
    }

    const rules = filterRulesByTrigger(allRules, trigger)

    if (rules.length === 0) {
      return { valid: true, errors: [] }
    }

    const value = this._state.value
    const fieldName = this.meta.name
    const errors: string[] = []
    let isValid = true
    let hasAsyncValidator = false

    for (const rule of rules) {
      if (rule.type === 'custom' && rule.validator) {
        try {
          const validatorResult = rule.validator(value)
          if (validatorResult instanceof Promise) {
            validatorResult.catch(() => {})
            hasAsyncValidator = true
            break
          } else {
            if (!validatorResult) {
              errors.push(rule.message || `${fieldName} validation failed`)
              isValid = false
              break
            }
          }
        } catch {
          errors.push(rule.message || `${fieldName} validation failed`)
          isValid = false
          break
        }
      } else {
        const error = this._validateRule(rule, value, fieldName)
        if (error) {
          errors.push(error)
          isValid = false
          break
        }
      }
    }

    if (hasAsyncValidator) {
      return this._validateAsync(trigger)
    }

    const result: ValidationResult = {
      valid: isValid,
      errors,
    }

    if (!isValid) {
      this._state.error = errors[0]
    } else {
      this._state.error = undefined
    }

    this._emit('stateChange', this._state)
    return result
  }

  private _validateRule(
    rule: import('@d-form/shared').ValidationRule,
    value: any,
    fieldName: string
  ): string | undefined {
    switch (rule.type) {
      case 'required':
        if (value === undefined || value === null || value === '') {
          return rule.message || `${fieldName} is required`
        }
        if (Array.isArray(value) && value.length === 0) {
          return rule.message || `${fieldName} is required`
        }
        return undefined

      case 'min':
        if (typeof value === 'number' && value < rule.value) {
          return rule.message || `${fieldName} must be at least ${rule.value}`
        }
        return undefined

      case 'max':
        if (typeof value === 'number' && value > rule.value) {
          return rule.message || `${fieldName} must be at most ${rule.value}`
        }
        return undefined

      case 'minLength':
        if (typeof value === 'string' && value.length < rule.value) {
          return rule.message || `${fieldName} must be at least ${rule.value} characters`
        }
        return undefined

      case 'maxLength':
        if (typeof value === 'string' && value.length > rule.value) {
          return rule.message || `${fieldName} must be at most ${rule.value} characters`
        }
        return undefined

      case 'pattern':
        if (typeof value === 'string' && !rule.value.test(value)) {
          return rule.message || `${fieldName} format is invalid`
        }
        return undefined

      default:
        return undefined
    }
  }

  private async _validateAsync(trigger?: ValidationTrigger): Promise<ValidationResult> {
    this._state.validating = true
    this._emit('stateChange', this._state)

    try {
      const result = await validateFieldAsync(this, this.meta.name, trigger)

      if (!result.valid) {
        this._state.error = result.errors[0]
      } else {
        this._state.error = undefined
      }

      return result
    } finally {
      this._state.validating = false
      this._emit('stateChange', this._state)
    }
  }

  on(event: FieldEvent, callback: Function): () => void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, new Set())
    }
    this._eventListeners.get(event)!.add(callback)

    return () => {
      this._eventListeners.get(event)?.delete(callback)
    }
  }

  private _emit(event: FieldEvent, ...args: any[]): void {
    const listeners = this._eventListeners.get(event)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(...args)
        } catch (error) {
          console.error(`Field event error (${event}):`, error)
        }
      })
    }
  }

  _setInitialValue(value: any): void {
    this._initialValue = value
  }
}
