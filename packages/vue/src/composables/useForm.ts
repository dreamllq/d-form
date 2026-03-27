import { ref, reactive, onUnmounted, getCurrentInstance, type Ref } from 'vue'
import { createForm, type Form, type FormOptions, type FormSchema, type FieldSchema } from '@d-form/core'

export interface UseFormOptions<T extends object = Record<string, any>> extends FormOptions<T> {
  /** Zod schema for validation */
  zodSchema?: any
}

export interface UseFormReturn<T extends object = Record<string, any>> {
  /** The underlying Form instance */
  form: Form
  /** Reactive form values */
  values: T
  /** Reactive form errors */
  errors: Record<string, string>
  /** Reactive touched state */
  touched: Record<string, boolean>
  /** Reactive dirty state */
  dirty: Ref<boolean>
  /** Reactive submitting state */
  submitting: Ref<boolean>
  /** Reactive valid state */
  isValid: Ref<boolean>
  /** Reactive validating state */
  validating: Ref<boolean>
  /** Reactive submitted state */
  submitted: Ref<boolean>
  /** Reactive submit count */
  submitCount: Ref<number>
  /** Set a field value */
  setFieldValue: (path: string, value: any) => void
  /** Set multiple field values */
  setValues: (values: Partial<T>) => void
  /** Set a field touched state */
  setFieldTouched: (path: string, touched: boolean) => void
  /** Get a field value */
  getFieldValue: (path: string) => any
  /** Get a field error */
  getFieldError: (path: string) => string | undefined
  /** Register a field */
  registerField: (path: string, schema?: FieldSchema) => any
  /** Submit the form */
  submit: (onSubmit?: () => Promise<void>) => Promise<void>
  /** Reset the form */
  reset: () => void
  /** Validate the form */
  validate: () => Promise<any>
  /** Clear all errors */
  clearErrors: () => void
  /** Get all errors */
  getErrors: () => Record<string, string>
}

export function useForm<T extends object = Record<string, any>>(
  schemaOrOptions?: FormSchema<T> | UseFormOptions<T>
): UseFormReturn<T> {
  const options: UseFormOptions<T> = isFormSchema(schemaOrOptions)
    ? { schema: schemaOrOptions }
    : (schemaOrOptions as UseFormOptions<T>) || {}

  const form = createForm({
    initialValues: options.initialValues,
    schema: options.schema,
    onSubmit: options.onSubmit,
    onValuesChange: options.onValuesChange,
    validateOnMount: options.validateOnMount,
    validateOnChange: options.validateOnChange,
    validateOnBlur: options.validateOnBlur,
    zodSchema: options.zodSchema
  } as any)

  const values = reactive<T>(form.getValues() as T)
  const errors = reactive<Record<string, string>>({})
  const touched = reactive<Record<string, boolean>>({})
  const dirty = ref(form.getState().dirty)
  const submitting = ref(form.getState().submitting)
  const isValid = ref(form.getState().isValid)
  const validating = ref(form.getState().validating)
  const submitted = ref(form.getState().submitted)
  const submitCount = ref(form.getState().submitCount)

  const syncState = () => {
    const state = form.getState()
    const formValues = form.getValues()
    Object.keys(formValues).forEach(key => {
      (values as any)[key] = formValues[key]
    })
    const formErrors = form.getErrors() as Record<string, string>
    Object.keys(errors).forEach(key => delete errors[key])
    Object.keys(formErrors).forEach(key => {
      ;(errors as Record<string, string>)[key] = formErrors[key]
    })
    Object.keys(touched).forEach(key => delete touched[key])
    Object.assign(touched, state.touched)
    dirty.value = state.dirty
    submitting.value = state.submitting
    isValid.value = state.isValid
    validating.value = state.validating
    submitted.value = state.submitted
    submitCount.value = state.submitCount
  }

  syncState()

  const setFieldValue = (path: string, value: any) => {
    if (!form.hasField(path)) {
      form.registerField(path, { type: 'string' })
    }
    form.setFieldValue(path, value)
    syncState()
  }

  const setValues = (newValues: Partial<T>) => {
    Object.keys(newValues as object).forEach(key => {
      if (!form.hasField(key)) {
        form.registerField(key, { type: 'string' })
      }
    })
    form.setValues(newValues as any)
    syncState()
  }

  const setFieldTouched = (path: string, isTouched: boolean) => {
    if (!form.hasField(path)) {
      form.registerField(path, { type: 'string' })
    }
    form.setFieldTouched(path, isTouched)
    syncState()
  }

  const getFieldValue = (path: string): any => {
    return form.getFieldValue(path)
  }

  const getFieldError = (path: string): string | undefined => {
    return form.getFieldError(path)
  }

  const registerField = (path: string, schema?: FieldSchema) => {
    const field = form.registerField(path, schema)
    syncState()
    return field
  }

  const submit = async (onSubmit?: () => Promise<void>) => {
    submitting.value = true
    try {
      await form.submit(onSubmit)
    } catch (error) {
      console.error(error)
    } finally {
      syncState()
    }
  }

  const reset = () => {
    form.reset()
    syncState()
  }

  const validate = async () => {
    const result = await form.validate()
    syncState()
    return result
  }

  const clearErrors = () => {
    form.clearErrors()
    syncState()
  }

  const getErrors = (): Record<string, string> => {
    return form.getErrors() as Record<string, string>
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      // Cleanup if needed
    })
  }

  return {
    form,
    values: values as T,
    errors,
    touched,
    dirty,
    submitting,
    isValid,
    validating,
    submitted,
    submitCount,
    setFieldValue,
    setValues,
    setFieldTouched,
    getFieldValue,
    getFieldError,
    registerField,
    submit,
    reset,
    validate,
    clearErrors,
    getErrors
  }
}

function isFormSchema<T>(obj: any): obj is FormSchema<T> {
  return obj && typeof obj === 'object' && obj.type === 'object' && 'properties' in obj
}
