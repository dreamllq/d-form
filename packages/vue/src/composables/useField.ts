import { ref, onUnmounted, type Ref } from 'vue'
import type { Form, Field } from '@d-form/core'
import type { FieldState, FieldSchema, ValidationResult } from '@d-form/shared'

export interface UseFieldOptions {
  /** Field schema configuration */
  schema?: FieldSchema
}

export interface UseFieldReturn<T = any> {
  /** Current field value */
  value: Ref<T>
  /** Field error message */
  error: Ref<string | undefined>
  /** Field touched state */
  touched: Ref<boolean>
  /** Field dirty state */
  dirty: Ref<boolean>
  /** Field visibility */
  visible: Ref<boolean>
  /** Field disabled state */
  disabled: Ref<boolean>
  /** Field is validating */
  validating: Ref<boolean>
  /** Set field value */
  setValue: (value: T) => void
  /** Set field touched state */
  setTouched: (touched: boolean) => void
  /** Validate field */
  validate: () => ValidationResult | Promise<ValidationResult>
  /** Field instance */
  field: Field | undefined
}

/**
 * Vue composable for managing individual field state
 * 
 * @example
 * ```ts
 * const { value, error, setValue, validate } = useField('email', form)
 * ```
 */
export function useField<T = any>(
  path: string,
  form: Form,
  options?: UseFieldOptions
): UseFieldReturn<T> {
  const field: Field | undefined = form.getField(path) || form.registerField(path, options?.schema)
  
  const value: Ref<T> = ref<T>(field?.getValue() as T) as Ref<T>
  const error = ref<string | undefined>(field?.getError())
  const touched = ref(field?.getState().touched ?? false)
  const dirty = ref(field?.getState().dirty ?? false)
  const visible = ref(field?.getState().visible ?? true)
  const disabled = ref(field?.getState().disabled ?? false)
  const validating = ref(field?.getState().validating ?? false)

  const setValue = (newValue: T) => {
    if (field) {
      form.setFieldValue(path, newValue)
      value.value = newValue
    }
  }

  const setTouched = (isTouched: boolean) => {
    if (field) {
      field.setTouched(isTouched)
      touched.value = isTouched
    }
  }

  const validate = (): ValidationResult | Promise<ValidationResult> => {
    if (field) {
      return field.validate()
    }
    return { valid: true, errors: [] }
  }

  let unsubscribeValueChange: (() => void) | undefined
  let unsubscribeStateChange: (() => void) | undefined

  if (field) {
    unsubscribeValueChange = field.on('valueChange', (newValue: T) => {
      value.value = newValue
    })

    unsubscribeStateChange = field.on('stateChange', (state: FieldState) => {
      error.value = state.error
      touched.value = state.touched
      dirty.value = state.dirty
      visible.value = state.visible
      disabled.value = state.disabled
      validating.value = state.validating
    })
  }

  onUnmounted(() => {
    unsubscribeValueChange?.()
    unsubscribeStateChange?.()
  })

  return {
    value,
    error,
    touched,
    dirty,
    visible,
    disabled,
    validating,
    setValue,
    setTouched,
    validate,
    field,
  }
}
