import type { 
  ValidationRule, 
  ValidationResult, 
  FieldValidationResult,
  FormValidationResult,
  FieldSchema 
} from '@d-form/shared'
import type { Field } from './models/field'
import type { Form } from './models/form'

export function createValidator(rules: ValidationRule[]) {
  return (value: any, fieldName?: string): ValidationResult => {
    const errors: string[] = []
    
    for (const rule of rules) {
      const error = validateRule(rule, value, fieldName)
      if (error) {
        errors.push(error)
        break
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

function validateRule(rule: ValidationRule, value: any, fieldName?: string): string | undefined {
  const name = fieldName || 'Field'
  
  switch (rule.type) {
    case 'required':
      if (value === undefined || value === null || value === '') {
        return rule.message || `${name} is required`
      }
      if (Array.isArray(value) && value.length === 0) {
        return rule.message || `${name} is required`
      }
      return undefined
      
    case 'min':
      if (typeof value === 'number' && value < rule.value) {
        return rule.message || `${name} must be at least ${rule.value}`
      }
      return undefined
      
    case 'max':
      if (typeof value === 'number' && value > rule.value) {
        return rule.message || `${name} must be at most ${rule.value}`
      }
      return undefined
      
    case 'minLength':
      if (typeof value === 'string' && value.length < rule.value) {
        return rule.message || `${name} must be at least ${rule.value} characters`
      }
      return undefined
      
    case 'maxLength':
      if (typeof value === 'string' && value.length > rule.value) {
        return rule.message || `${name} must be at most ${rule.value} characters`
      }
      return undefined
      
    case 'pattern':
      if (typeof value === 'string' && !rule.value.test(value)) {
        return rule.message || `${name} format is invalid`
      }
      return undefined
      
    case 'custom':
      if (rule.validator) {
        const result = rule.validator(value)
        if (!result) {
          return rule.message || `${name} validation failed`
        }
      }
      return undefined
      
    default:
      return undefined
  }
}

export function validateFieldSync(
  field: Field,
  fieldName?: string
): ValidationResult {
  const schema = field.meta.schema
  const value = field.getValue()
  const rules = schema?.validation?.rules || []
  
  const errors: string[] = []
  let isValid = true
  
  for (const rule of rules) {
    if (rule.type === 'custom' && rule.validator) {
      try {
        const result = rule.validator(value)
        if (!result) {
          errors.push(rule.message || `${fieldName || field.meta.name} validation failed`)
          isValid = false
          break
        }
      } catch (error) {
        errors.push(rule.message || `${fieldName || field.meta.name} validation failed`)
        isValid = false
        break
      }
    } else {
      const error = validateRule(rule, value, fieldName || field.meta.name)
      if (error) {
        errors.push(error)
        isValid = false
        break
      }
    }
  }
  
  return {
    valid: isValid,
    errors
  }
}

export async function validateFieldAsync(
  field: Field,
  fieldName?: string
): Promise<ValidationResult> {
  const schema = field.meta.schema
  const value = field.getValue()
  const rules = schema?.validation?.rules || []
  
  const errors: string[] = []
  let isValid = true
  
  for (const rule of rules) {
    if (rule.type === 'custom' && rule.validator) {
      field.setState({ validating: true })
      try {
        const result = await rule.validator(value)
        if (!result) {
          errors.push(rule.message || `${fieldName || field.meta.name} validation failed`)
          isValid = false
          break
        }
      } catch (error) {
        errors.push(rule.message || `${fieldName || field.meta.name} validation failed`)
        isValid = false
        break
      } finally {
        field.setState({ validating: false })
      }
    } else {
      const error = validateRule(rule, value, fieldName || field.meta.name)
      if (error) {
        errors.push(error)
        isValid = false
        break
      }
    }
  }
  
  const result: ValidationResult = {
    valid: isValid,
    errors
  }
  
  if (!isValid) {
    field.setError(errors[0])
  } else {
    field.setError(undefined)
  }
  
  return result
}

export function validateField(
  field: Field,
  fieldName?: string
): ValidationResult | Promise<ValidationResult> {
  const schema = field.meta.schema
  const value = field.getValue()
  const rules = schema?.validation?.rules || []
  
  const hasAsyncValidator = rules.some(r => r.type === 'custom' && r.validator)
  
  if (hasAsyncValidator) {
    return validateFieldAsync(field, fieldName)
  }
  
  return validateFieldSync(field, fieldName)
}

export async function validateForm(form: Form): Promise<FormValidationResult> {
  const fields = form.getFieldNames()
  const fieldResults: Record<string, ValidationResult> = {}
  const allErrors: string[] = []
  let isValid = true
  
  for (const fieldName of fields) {
    const field = form.getField(fieldName)
    if (!field) continue
    
    if (field.getState().visible === false && field.meta.schema?.validation?.validateVisibleOnly) {
      continue
    }
    
    const result = await validateFieldAsync(field, fieldName)
    fieldResults[fieldName] = result
    
    if (!result.valid) {
      isValid = false
      allErrors.push(...result.errors)
    }
  }
  
  form.setState({ isValid, validating: false })
  
  return {
    valid: isValid,
    fields: fieldResults,
    errors: allErrors
  }
}
