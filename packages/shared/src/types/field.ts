/**
 * Field types for d-form
 */

import type { ValidationConfig } from './validation'
import type { ReactionConfig } from './reaction'

export type FieldType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'date'
  | 'void'

export interface FieldSchema<T = any> {
  /** Field type */
  type: FieldType | string
  /** Field key/path */
  key?: string
  /** Field label/title */
  title?: string
  /** Field description/help text */
  description?: string
  /** Default value */
  default?: T
  /** Component name to render */
  component?: string
  /** Component props */
  componentProps?: Record<string, any>
  /** Validation configuration */
  validation?: ValidationConfig
  /** Reaction configuration */
  reactions?: ReactionConfig[]
  /** Field visibility */
  visible?: boolean
  /** Field disabled state */
  disabled?: boolean
  /** Field placeholder */
  placeholder?: string
  /** Field required marker */
  required?: boolean
  /** Custom enum values */
  enum?: Array<{ label: string; value: any }> | any[]
  /** Nested properties (for object type) */
  properties?: Record<string, FieldSchema>
  /** Array items schema (for array type) */
  items?: FieldSchema
}

export interface FieldState<T = any> {
  /** Current field value */
  value: T
  /** Validation error message */
  error?: string
  /** Field has been touched/blurred */
  touched: boolean
  /** Field value has been modified */
  dirty: boolean
  /** Field visibility state */
  visible: boolean
  /** Field disabled state */
  disabled: boolean
  /** Field is currently being validated */
  validating: boolean
  /** Field is currently loading (async data) */
  loading?: boolean
  /** Custom display value (different from actual value) */
  displayValue?: any
}

export interface FieldMeta {
  /** Field path */
  path: string
  /** Field name */
  name: string
  /** Field schema reference */
  schema: FieldSchema
  /** Parent field path */
  parentPath?: string
  /** Field depth in form */
  depth: number
}

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

import type { ValidationResult } from './validation'
