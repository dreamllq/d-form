/**
 * Form types for d-form
 */

import type { FieldSchema, FieldState } from './field'
import type { GridConfig } from './grid'
import type { ReactionSchema } from './reaction'
import type { FormValidationResult } from './validation'

export interface UISchema {
  /** Form layout direction */
  layout?: 'horizontal' | 'vertical' | 'inline'
  /** Label width (e.g., '100px', 100) */
  labelWidth?: string | number
  /** Gutter between fields */
  gutter?: number
  /** Number of columns in grid layout */
  columns?: number
  /** Form size */
  size?: 'small' | 'default' | 'large'
  /** Label position */
  labelPosition?: 'left' | 'right' | 'top'
  /** Show colon after label */
  colon?: boolean
  /** Show required asterisk */
  showRequiredAsterisk?: boolean
  /** Grid layout configuration */
  grid?: GridConfig
  /** Minimum number of columns */
  minColumns?: number
}

export interface FormSchema<T = Record<string, any>> {
  /** Schema type (always 'object' for forms) */
  type: 'object'
  /** Form field schemas */
  properties: Record<string, FieldSchema>
  /** UI configuration */
  uiSchema?: UISchema
  /** Form-level reactions */
  reactions?: ReactionSchema[]
  /** Form title */
  title?: string
  /** Form description */
  description?: string
  /** Default form values */
  default?: T
}

export interface FormState<T = Record<string, any>> {
  /** Form values */
  values: T
  /** Field-level errors */
  errors: Partial<Record<keyof T, string>>
  /** Field-level touched state */
  touched: Partial<Record<keyof T, boolean>>
  /** Form has been modified */
  dirty: boolean
  /** Form is submitting */
  submitting: boolean
  /** Form is valid (no errors) */
  isValid: boolean
  /** Form is validating */
  validating: boolean
  /** Form has been submitted at least once */
  submitted: boolean
  /** Form submission count */
  submitCount: number
}

export interface FormInstance<T = Record<string, any>> {
  /** Form schema */
  schema: FormSchema<T>
  /** Current form state */
  state: FormState<T>
  /** Field states by path */
  fields: Map<string, FieldState>
  /** Get field value by path */
  getFieldValue: (path: string) => any
  /** Set field value by path */
  setFieldValue: (path: string, value: any) => void
  /** Get field state by path */
  getFieldState: (path: string) => FieldState | undefined
  /** Set field state by path */
  setFieldState: (path: string, state: Partial<FieldState>) => void
  /** Get all form values */
  getValues: () => T
  /** Set all form values */
  setValues: (values: Partial<T>) => void
  /** Validate all fields */
  validate: () => Promise<FormValidationResult>
  /** Validate specific field */
  validateField: (path: string) => Promise<FormValidationResult>
  /** Reset form to initial state */
  reset: () => void
  /** Reset specific field */
  resetField: (path: string) => void
  /** Submit form */
  submit: () => Promise<T>
  /** Get form errors */
  getErrors: () => Record<string, string>
  /** Set form errors */
  setErrors: (errors: Record<string, string>) => void
  /** Clear all errors */
  clearErrors: () => void
}

export interface FormOptions<T = Record<string, any>> {
  /** Form schema */
  schema?: FormSchema<T>
  /** Initial values */
  initialValues?: Partial<T>
  /** onSubmit callback */
  onSubmit?: (values: T) => Promise<void> | void
  /** onValuesChange callback */
  onValuesChange?: (values: T, changedPath: string) => void
  /** Validate on mount */
  validateOnMount?: boolean
  /** Validate on change */
  validateOnChange?: boolean
  /** Validate on blur */
  validateOnBlur?: boolean
}

export type FormEventHandler = (event: {
  type: 'change' | 'blur' | 'focus' | 'submit'
  path: string
  value?: any
  form: FormInstance
}) => void
