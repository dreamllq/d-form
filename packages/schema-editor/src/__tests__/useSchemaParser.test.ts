import { describe, it, expect } from 'vitest'
import { parseSchema, schemaToJson, validateSchemaStructure } from '../composables/useSchemaParser'

describe('parseSchema', () => {
  it('parses valid FormSchema JSON', () => {
    const result = parseSchema('{"type":"object","properties":{}}')
    expect(result.valid).toBe(true)
    expect(result.schema).toEqual({ type: 'object', properties: {} })
    expect(result.error).toBeNull()
  })

  it('rejects invalid JSON', () => {
    const result = parseSchema('{invalid json}')
    expect(result.valid).toBe(false)
    expect(result.schema).toBeNull()
    expect(result.error).toBeTruthy()
  })

  it('rejects empty string', () => {
    const result = parseSchema('')
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('rejects null literal', () => {
    const result = parseSchema('null')
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('rejects missing properties field', () => {
    const result = parseSchema('{"type":"object"}')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('properties')
  })

  it('rejects non-object type', () => {
    const result = parseSchema('{"type":"array","properties":{}}')
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('parses valid FormSchema with fields', () => {
    const json =
      '{"type":"object","properties":{"name":{"type":"string","title":"姓名","component":"input"}}}'
    const result = parseSchema(json)
    expect(result.valid).toBe(true)
    expect(result.schema?.properties?.name).toBeDefined()
  })
})

describe('schemaToJson', () => {
  it('serializes schema to formatted JSON', () => {
    const schema = { type: 'object' as const, properties: {} }
    const json = schemaToJson(schema)
    const parsed = JSON.parse(json)
    expect(parsed).toEqual(schema)
  })

  it('returns {} for null', () => {
    expect(schemaToJson(null)).toBe('{}')
  })

  it('returns {} for undefined', () => {
    expect(schemaToJson(undefined)).toBe('{}')
  })
})

describe('validateSchemaStructure', () => {
  it('validates correct structure', () => {
    const result = validateSchemaStructure({
      type: 'object',
      properties: {},
    })
    expect(result.valid).toBe(true)
  })

  it('rejects non-object type', () => {
    const result = validateSchemaStructure({
      type: 'array',
      properties: {},
    })
    expect(result.valid).toBe(false)
  })

  it('rejects missing properties', () => {
    const result = validateSchemaStructure({ type: 'object' })
    expect(result.valid).toBe(false)
  })
})
