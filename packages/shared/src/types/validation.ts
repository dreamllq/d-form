/**
 * Validation types for d-form
 */

import { z } from 'zod'

export const ValidationTrigger = z.enum(['blur', 'change'])

export type ValidationTrigger = z.infer<typeof ValidationTrigger>

export const ValidationRule = z.object({
  /** Validation rule type */
  type: z.enum(['required', 'min', 'max', 'minLength', 'maxLength', 'pattern', 'custom']),
  /** Rule value (e.g., min: 5, maxLength: 10) */
  value: z.any().optional(),
  /** Custom error message */
  message: z.string().optional(),
  /** Custom validator function for 'custom' type */
  validator: z.any().optional(),
  /** Undefined = matches all triggers (Element Plus convention) */
  trigger: z.union([ValidationTrigger, z.array(ValidationTrigger)]).optional(),
})

export type ValidationRule = z.infer<typeof ValidationRule>

export const ValidationConfig = z.object({
  /** Array of validation rules */
  rules: z.array(ValidationRule).optional(),
  /** Custom validator function name or expression */
  validator: z.string().optional(),
  /** Trigger validation on: blur, change, submit */
  trigger: z
    .union([z.enum(['blur', 'change', 'submit']), z.array(z.enum(['blur', 'change', 'submit']))])
    .optional(),
  /** Validate when field is visible only */
  validateVisibleOnly: z.boolean().optional(),
})

export type ValidationConfig = z.infer<typeof ValidationConfig>

export const ValidationResult = z.object({
  /** Whether validation passed */
  valid: z.boolean(),
  /** Array of error messages */
  errors: z.array(z.string()),
  /** Warning messages (non-blocking) */
  warnings: z.array(z.string()).optional(),
})

export type ValidationResult = z.infer<typeof ValidationResult>

export const FieldValidationResult = z.object({
  /** Field name/path */
  field: z.string(),
  /** Validation result */
  result: ValidationResult,
})

export type FieldValidationResult = z.infer<typeof FieldValidationResult>

export const FormValidationResult = z.object({
  /** Whether form is valid */
  valid: z.boolean(),
  /** Field-level validation results */
  fields: z.record(z.string(), ValidationResult),
  /** All error messages */
  errors: z.array(z.string()),
})

export type FormValidationResult = z.infer<typeof FormValidationResult>
