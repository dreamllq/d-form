/**
 * Validation types for d-form
 */

export interface ValidationRule {
  /** Validation rule type */
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  /** Rule value (e.g., min: 5, maxLength: 10) */
  value?: any
  /** Custom error message */
  message?: string
  /** Custom validator function for 'custom' type */
  validator?: (value: any) => boolean | Promise<boolean>
}

export interface ValidationConfig {
  /** Array of validation rules */
  rules?: ValidationRule[]
  /** Custom validator function name or expression */
  validator?: string
  /** Trigger validation on: blur, change, submit */
  trigger?: 'blur' | 'change' | 'submit' | ('blur' | 'change' | 'submit')[]
  /** Validate when field is visible only */
  validateVisibleOnly?: boolean
}

export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean
  /** Array of error messages */
  errors: string[]
  /** Warning messages (non-blocking) */
  warnings?: string[]
}

export interface FieldValidationResult {
  /** Field name/path */
  field: string
  /** Validation result */
  result: ValidationResult
}

export interface FormValidationResult {
  /** Whether form is valid */
  valid: boolean
  /** Field-level validation results */
  fields: Record<string, ValidationResult>
  /** All error messages */
  errors: string[]
}
