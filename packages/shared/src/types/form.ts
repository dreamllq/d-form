/**
 * Form types for d-form
 */

import { z } from 'zod'
import { FieldSchema, FieldState } from './field'
import { GridConfig } from './grid'
import { ReactionSchema } from './reaction'
import { FormValidationResult } from './validation'

export const UISchema = z.object({
  /** Form layout direction */
  layout: z.enum(['vertical', 'inline']).optional(),
  /** Label width (e.g., '100px', 100) */
  labelWidth: z.union([z.string(), z.number()]).optional(),
  /** Gutter between fields */
  gutter: z.number().optional(),
  /** Number of columns in grid layout */
  columns: z.number().optional(),
  /** Form size */
  size: z.enum(['small', 'default', 'large']).optional(),
  /** Label position */
  labelPosition: z.enum(['left', 'right', 'top']).optional(),
  /** Show colon after label */
  colon: z.boolean().optional(),
  /** Show required asterisk */
  showRequiredAsterisk: z.boolean().optional(),
  /** Grid layout configuration */
  grid: GridConfig.optional(),
  /** Minimum number of columns */
  minColumns: z.number().optional(),
})

export type UISchema = z.infer<typeof UISchema>

export const FormSchema = z.object({
  /** Schema type (always 'object' for forms) */
  type: z.literal('object'),
  /** Form field schemas */
  properties: z.record(z.string(), FieldSchema),
  /** UI configuration */
  uiSchema: UISchema.optional(),
  /** Form-level reactions */
  reactions: z.array(ReactionSchema).optional(),
  /** Form title */
  title: z.string().optional(),
  /** Form description */
  description: z.string().optional(),
  /** Default form values */
  default: z.record(z.string(), z.any()).optional(),
})

/**
 * FormSchema type — preserves the original generic for backward compatibility.
 * The generic T only affects the `default` field.
 */
export type FormSchema<T = Record<string, any>> = Omit<z.infer<typeof FormSchema>, 'default'> & {
  default?: T
}

export const FormState = z.object({
  /** Form values */
  values: z.record(z.string(), z.any()),
  /** Field-level errors */
  errors: z.record(z.string(), z.string().optional()).optional(),
  /** Field-level touched state */
  touched: z.record(z.string(), z.boolean().optional()).optional(),
  /** Form has been modified */
  dirty: z.boolean(),
  /** Form is submitting */
  submitting: z.boolean(),
  /** Form is valid (no errors) */
  isValid: z.boolean(),
  /** Form is validating */
  validating: z.boolean(),
  /** Form has been submitted at least once */
  submitted: z.boolean(),
  /** Form submission count */
  submitCount: z.number(),
})

/**
 * FormState type — preserves the original generic for backward compatibility.
 * The generic T affects `values`, `errors`, and `touched` fields.
 */
export type FormState<T = Record<string, any>> = {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  dirty: boolean
  submitting: boolean
  isValid: boolean
  validating: boolean
  submitted: boolean
  submitCount: number
}

/**
 * FormInstance — kept as TypeScript interface (contains methods, not serializable).
 */
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

export const FormOptions = z.object({
  /** Form schema */
  schema: FormSchema.optional(),
  /** Initial values */
  initialValues: z.record(z.string(), z.any()).optional(),
  /** onSubmit callback */
  onSubmit: z.any().optional(),
  /** onValuesChange callback */
  onValuesChange: z.any().optional(),
  /** Validate on mount */
  validateOnMount: z.boolean().optional(),
  /** Validate on change */
  validateOnChange: z.boolean().optional(),
  /** Validate on blur */
  validateOnBlur: z.boolean().optional(),
})

/**
 * FormOptions type — preserves the original generic for backward compatibility.
 */
export type FormOptions<T = Record<string, any>> = {
  schema?: FormSchema<T>
  initialValues?: Partial<T>
  onSubmit?: (values: T) => Promise<void> | void
  onValuesChange?: (values: T, changedPath: string) => void
  validateOnMount?: boolean
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

/**
 * FormEventHandler — kept as TypeScript type (function type).
 */
export type FormEventHandler = (event: {
  type: 'change' | 'blur' | 'focus' | 'submit'
  path: string
  value?: any
  form: FormInstance
}) => void
