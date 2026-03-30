import { describe, it, expect, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { useSchemaSync } from '../composables/useSchemaSync'

// Mock useSchemaParser since T3 is implementing it in parallel
vi.mock('../composables/useSchemaParser', () => ({
  parseSchema: vi.fn((content: string) => {
    try {
      const parsed = JSON.parse(content)
      return { valid: true, schema: parsed, error: null }
    } catch (e: any) {
      return { valid: false, schema: null, error: e.message }
    }
  }),
  schemaToJson: vi.fn((schema: any) => {
    if (!schema) return '{}'
    return JSON.stringify(schema, null, 2)
  }),
}))

describe('useSchemaSync', () => {
  it('defaults activeTab to preview', () => {
    const schema = ref({ type: 'object' as const, properties: {} })
    const sync = useSchemaSync(schema)
    expect(sync.activeTab.value).toBe('preview')
  })

  it('initializes editorContent from schema prop', () => {
    const schema = ref({
      type: 'object' as const,
      properties: { name: { type: 'string' } },
    })
    const sync = useSchemaSync(schema)
    expect(sync.editorContent.value).toContain('"type": "object"')
    expect(sync.editorContent.value).toContain('"name"')
  })

  it('updateFromEditor with valid JSON sets parsedSchema and clears error', async () => {
    const schema = ref({ type: 'object' as const, properties: {} })
    const sync = useSchemaSync(schema)
    vi.useFakeTimers()

    const validJson = '{"type":"object","properties":{"test":{"type":"string"}}}'
    sync.updateFromEditor(validJson)

    vi.advanceTimersByTime(350)
    await nextTick()

    expect(sync.parseError.value).toBeNull()
    expect(sync.parsedSchema.value).toBeTruthy()

    vi.useRealTimers()
  })

  it('updateFromEditor with invalid JSON sets parseError and keeps last valid schema', async () => {
    const schema = ref({ type: 'object' as const, properties: {} })
    const sync = useSchemaSync(schema)
    vi.useFakeTimers()

    // First set a valid state
    sync.updateFromEditor('{"type":"object","properties":{}}')
    vi.advanceTimersByTime(350)
    await nextTick()

    // Now send invalid
    sync.updateFromEditor('{invalid}')
    vi.advanceTimersByTime(350)
    await nextTick()

    expect(sync.parseError.value).toBeTruthy()
    // parsedSchema should still have the last valid value
    expect(sync.parsedSchema.value).toBeTruthy()

    vi.useRealTimers()
  })

  it('updateFromProp updates editorContent and parsedSchema', async () => {
    const schema = ref({ type: 'object' as const, properties: {} })
    const sync = useSchemaSync(schema)

    const newSchema = {
      type: 'object' as const,
      properties: { age: { type: 'number' } },
    }
    sync.updateFromProp(newSchema)
    await nextTick()

    expect(sync.editorContent.value).toContain('"age"')
    expect(sync.parsedSchema.value).toEqual(newSchema)
  })

  it('debounces rapid updateFromEditor calls', async () => {
    const schema = ref({ type: 'object' as const, properties: {} })
    const sync = useSchemaSync(schema)
    vi.useFakeTimers()

    // Rapid calls
    sync.updateFromEditor('{"type":"object","properties":{"a":{"type":"string"}}}')
    sync.updateFromEditor('{"type":"object","properties":{"b":{"type":"string"}}}')
    sync.updateFromEditor('{"type":"object","properties":{"c":{"type":"string"}}}')

    // Before debounce fires — parsedSchema should still be initial
    expect(sync.parsedSchema.value?.properties).toEqual({})

    // After debounce (300ms)
    vi.advanceTimersByTime(350)
    await nextTick()

    expect(sync.parsedSchema.value?.properties?.c).toBeDefined()

    vi.useRealTimers()
  })

  it('handles empty/null schema prop', () => {
    const schema = ref({ type: 'object' as const, properties: {} })
    const sync = useSchemaSync(schema)

    sync.updateFromProp(null as any)
    expect(sync.editorContent.value).toBe('{}')
  })

  it('parsedSchema is computed from editor content', async () => {
    const schema = ref({ type: 'object' as const, properties: {} })
    const sync = useSchemaSync(schema)
    vi.useFakeTimers()

    sync.updateFromEditor('{"type":"object","properties":{"x":{"type":"boolean"}}}')
    vi.advanceTimersByTime(350)
    await nextTick()

    expect(sync.parsedSchema.value?.properties?.x).toBeDefined()

    vi.useRealTimers()
  })
})
