import type { ValidationResult, FormValidationResult } from '@d-form/shared'
import type { ZodType, ZodError } from 'zod'

export function extractZodErrorMessages(error: ZodError): string[] {
  return error.issues.map((issue) => issue.message)
}

export function mapZodErrorsToFields(
  error: ZodError
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    
    if (!fieldErrors[path]) {
      fieldErrors[path] = []
    }
    fieldErrors[path].push(issue.message)
  }
  
  return fieldErrors
}

export function validateWithZodSync<T>(
  schema: ZodType<T>,
  value: unknown
): ValidationResult {
  const result = schema.safeParse(value)
  
  if (result.success) {
    return { valid: true, errors: [] }
  }
  
  return {
    valid: false,
    errors: extractZodErrorMessages(result.error)
  }
}

export async function validateWithZodAsync<T>(
  schema: ZodType<T>,
  value: unknown
): Promise<ValidationResult> {
  try {
    await schema.parseAsync(value)
    return { valid: true, errors: [] }
  } catch (error: unknown) {
    const zodError = error as ZodError
    if (zodError.issues) {
      return {
        valid: false,
        errors: extractZodErrorMessages(zodError)
      }
    }
    return {
      valid: false,
      errors: ['Validation failed']
    }
  }
}

export function validateWithZod<T>(
  schema: ZodType<T>,
  value: unknown
): ValidationResult | Promise<ValidationResult> {
  const result = schema.safeParse(value)
  
  if (result.success) {
    return { valid: true, errors: [] }
  }
  
  if (result.error.issues.length > 0) {
    return {
      valid: false,
      errors: extractZodErrorMessages(result.error)
    }
  }
  
  return validateWithZodAsync(schema, value)
}

export async function validateFieldWithZod<T extends Record<string, any>>(
  schema: ZodType<T>,
  fieldName: string,
  value: unknown
): Promise<ValidationResult> {
  const shape = (schema as any)._def?.shape || (schema as any).shape
  
  if (shape && shape[fieldName]) {
    return validateWithZodAsync(shape[fieldName], value)
  }
  
  try {
    const objValue = { [fieldName]: value } as T
    await schema.parseAsync(objValue)
    return { valid: true, errors: [] }
  } catch (error: unknown) {
    const zodError = error as ZodError
    if (zodError.issues) {
      const fieldErrors = mapZodErrorsToFields(zodError)
      return {
        valid: fieldName in fieldErrors,
        errors: fieldErrors[fieldName] || []
      }
    }
    return { valid: false, errors: ['Validation failed'] }
  }
}

export async function validateFormWithZod<T extends Record<string, any>>(
  schema: ZodType<T>,
  values: unknown,
  fieldNames?: string[]
): Promise<FormValidationResult> {
  const fieldResults: Record<string, ValidationResult> = {}
  
  if (fieldNames) {
    for (const name of fieldNames) {
      fieldResults[name] = { valid: true, errors: [] }
    }
  }
  
  try {
    await schema.parseAsync(values)
    
    return {
      valid: true,
      fields: fieldResults,
      errors: []
    }
  } catch (error: unknown) {
    const zodError = error as ZodError
    
    if (!zodError.issues) {
      return {
        valid: false,
        fields: fieldResults,
        errors: ['Validation failed']
      }
    }
    
    const fieldErrors = mapZodErrorsToFields(zodError)
    const allErrors: string[] = []
    
    for (const [path, errors] of Object.entries(fieldErrors)) {
      fieldResults[path] = {
        valid: false,
        errors
      }
      allErrors.push(...errors)
    }
    
    if (fieldNames) {
      for (const name of fieldNames) {
        if (!(name in fieldResults)) {
          fieldResults[name] = { valid: true, errors: [] }
        }
      }
    }
    
    return {
      valid: false,
      fields: fieldResults,
      errors: allErrors
    }
  }
}

export function createZodValidator<T>(
  schema: ZodType<T>
): (value: unknown) => ValidationResult | Promise<ValidationResult> {
  return (value: unknown) => validateWithZod(schema, value)
}

export function isZodError(error: unknown): error is ZodError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'issues' in error &&
    Array.isArray((error as ZodError).issues)
  )
}

export function getFirstError(result: ValidationResult): string | undefined {
  return result.errors[0]
}
