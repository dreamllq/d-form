/**
 * Field types for d-form
 */

import { z } from 'zod'
import { ReactionConfig } from './reaction'
import { ValidationConfig, type ValidationResult } from './validation'

export const FieldType = z.enum(['string', 'number', 'boolean', 'object', 'array', 'date', 'void'])

export type FieldType = z.infer<typeof FieldType>

/**
 * Field schema — recursive via getter pattern (Zod v4).
 * `properties` and `items` reference FieldSchema itself;
 * `reactions` references ReactionConfig from ./reaction (circular module dep, safe via ESM live bindings).
 */
export const FieldSchema = z.object({
  /** Field type */
  type: z.string(),
  /** Field key/path */
  key: z.string().optional(),
  /** Field label/title */
  title: z.string().optional(),
  /** Field description/help text */
  description: z.string().optional(),
  /** Default value */
  default: z.any().optional(),
  /** Component name to render */
  component: z.string().optional(),
  /** Component props */
  componentProps: z.record(z.string(), z.any()).optional(),
  /** Validation configuration */
  validation: ValidationConfig.optional(),
  /** Reaction configuration */
  get reactions() {
    return z.array(ReactionConfig).optional()
  },
  /** Field visibility */
  visible: z.boolean().optional(),
  /** Field disabled state */
  disabled: z.boolean().optional(),
  /** Field placeholder */
  placeholder: z.string().optional(),
  /** Label position override for this field */
  labelPosition: z.enum(['left', 'right', 'top']).optional(),
  /** Label width override for this field (e.g. '100px', 100) */
  labelWidth: z.union([z.string(), z.number()]).optional(),
  /** Field required marker */
  required: z.boolean().optional(),
  /** Custom enum values */
  enum: z.array(z.any()).optional(),
  /** Nested properties (for object type) */
  get properties() {
    return z.record(z.string(), FieldSchema).optional()
  },
  /** Array items schema (for array type) */
  get items() {
    return FieldSchema.optional()
  },
})

/**
 * FieldSchema type — preserves the original generic for backward compatibility.
 * The generic T only affects the `default` field.
 */
export type FieldSchema<T = any> = Omit<z.infer<typeof FieldSchema>, 'default'> & { default?: T }

export const FieldState = z.object({
  /** Current field value */
  value: z.any(),
  /** Validation error message */
  error: z.string().optional(),
  /** Field has been touched/blurred */
  touched: z.boolean(),
  /** Field value has been modified */
  dirty: z.boolean(),
  /** Field visibility state */
  visible: z.boolean(),
  /** Field disabled state */
  disabled: z.boolean(),
  /** Field is currently being validated */
  validating: z.boolean(),
  /** Field is currently loading (async data) */
  loading: z.boolean().optional(),
  /** Custom display value (different from actual value) */
  displayValue: z.any().optional(),
})

export type FieldState<T = any> = Omit<z.infer<typeof FieldState>, 'value' | 'displayValue'> & {
  value: T
  displayValue?: any
}

export const FieldMeta = z.object({
  /** Field path */
  path: z.string(),
  /** Field name */
  name: z.string(),
  /** Field schema reference */
  schema: FieldSchema,
  /** Parent field path */
  parentPath: z.string().optional(),
  /** Field depth in form */
  depth: z.number(),
})

export type FieldMeta = z.infer<typeof FieldMeta>

/**
 * FieldInstance — kept as TypeScript interface (contains methods, not serializable).
 */
export interface FieldInstance {
  /** Field metadata */
  meta: FieldMeta
  /** Current field state */
  state: FieldState
  /** Update field value */
  setValue: (value: any) => void
  /** Set field error */
  setError: (error: string | undefined) => void
  /** Set field touched */
  setTouched: (touched: boolean) => void
  /** Validate field */
  validate: () => Promise<ValidationResult>
  /** Reset field */
  reset: () => void
}
