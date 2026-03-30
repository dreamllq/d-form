import type { FormSchema } from '@d-form/shared'

export interface ParseResult {
  valid: boolean
  schema: FormSchema | null
  error: string | null
}

export function validateSchemaStructure(parsed: unknown): { valid: boolean; error?: string } {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { valid: false, error: 'Schema must be a non-null object' }
  }

  const obj = parsed as Record<string, unknown>

  if (obj.type !== 'object') {
    return { valid: false, error: 'Schema type must be "object"' }
  }

  if (!('properties' in obj)) {
    return { valid: false, error: 'Schema must have a "properties" field' }
  }

  if (
    typeof obj.properties !== 'object' ||
    obj.properties === null ||
    Array.isArray(obj.properties)
  ) {
    return { valid: false, error: '"properties" must be an object' }
  }

  return { valid: true }
}

export function parseSchema(jsonString: string): ParseResult {
  if (!jsonString || jsonString.trim() === '') {
    return { valid: false, schema: null, error: 'Input cannot be empty' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid JSON'
    return { valid: false, schema: null, error: `JSON parse error: ${message}` }
  }

  const validation = validateSchemaStructure(parsed)
  if (!validation.valid) {
    return { valid: false, schema: null, error: validation.error! }
  }

  return { valid: true, schema: parsed as FormSchema, error: null }
}

export function schemaToJson(schema: FormSchema | null | undefined): string {
  if (schema == null) return '{}'
  return JSON.stringify(schema, null, 2)
}
