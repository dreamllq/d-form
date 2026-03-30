import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { defineComponentRegistry, defineFormSchema } from '../types'
import type { WrapFieldSchema, ComponentPropsRegistry } from '../types'

// Helper for compile-time type checking — if this function accepts the value,
// the types are compatible. Used in tests to assert type-level correctness.
function acceptType<T>(val: T): T {
  return val
}

describe('defineComponentRegistry', () => {
  it('returns the registry as-is and preserves keys', () => {
    const registry = defineComponentRegistry({
      input: z.object({ placeholder: z.string().optional() }),
      select: z.object({
        options: z.array(z.object({ label: z.string(), value: z.any() })),
      }),
    })

    expect(registry.input).toBeDefined()
    expect(registry.select).toBeDefined()
  })

  it('preserves zod schema types for parsing valid data', () => {
    const registry = defineComponentRegistry({
      input: z.object({
        placeholder: z.string().optional(),
        clearable: z.boolean().optional(),
      }),
    })

    const result = registry.input.parse({ placeholder: 'Enter name', clearable: true })
    expect(result).toEqual({ placeholder: 'Enter name', clearable: true })

    // Optional fields can be omitted
    const minimal = registry.input.parse({})
    expect(minimal).toEqual({})
  })

  it('rejects invalid data via zod parse', () => {
    const registry = defineComponentRegistry({
      input: z.object({ placeholder: z.string() }), // placeholder required
    })

    expect(() => registry.input.parse({ placeholder: 123 })).toThrow()
    expect(() => registry.input.parse({})).toThrow()
  })
})

describe('defineFormSchema', () => {
  const registry = defineComponentRegistry({
    input: z.object({
      placeholder: z.string().optional(),
      clearable: z.boolean().optional(),
    }),
    select: z.object({
      options: z.array(z.object({ label: z.string(), value: z.any() })),
      multiple: z.boolean().optional(),
    }),
  })

  it('returns a FormSchema with correct structure', () => {
    const schema = defineFormSchema(registry, {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          component: 'input',
          componentProps: { placeholder: 'Name' },
        },
      },
    })

    expect(schema.type).toBe('object')
    expect(schema.properties.name).toBeDefined()
    expect(schema.properties.name.type).toBe('string')
  })

  it('allows fields without component (missing component fallback)', () => {
    const schema = defineFormSchema(registry, {
      type: 'object',
      properties: {
        hidden: { type: 'string' },
      },
    })

    expect(schema.properties.hidden.type).toBe('string')
    expect(schema.properties.hidden.component).toBeUndefined()
  })

  it('allows fields with unknown component (fallback to Record<string, any>)', () => {
    const schema = defineFormSchema(registry, {
      type: 'object',
      properties: {
        custom: {
          type: 'string',
          component: 'custom-widget',
          componentProps: { anything: 'goes', here: 42 },
        },
      },
    })

    expect(schema.properties.custom.component).toBe('custom-widget')
    expect(schema.properties.custom.componentProps).toEqual({
      anything: 'goes',
      here: 42,
    })
  })

  it('preserves all FormSchema fields (title, description, uiSchema)', () => {
    const schema = defineFormSchema(registry, {
      type: 'object',
      properties: {
        name: { type: 'string', component: 'input' },
      },
      title: 'Test Form',
      description: 'A test form',
      uiSchema: { layout: 'vertical', labelWidth: '100px' },
    })

    expect(schema.title).toBe('Test Form')
    expect(schema.description).toBe('A test form')
    expect(schema.uiSchema?.layout).toBe('vertical')
    expect(schema.uiSchema?.labelWidth).toBe('100px')
  })

  it('works with multiple typed components in the same schema', () => {
    const schema = defineFormSchema(registry, {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          component: 'input',
          componentProps: { placeholder: 'Your name' },
        },
        role: {
          type: 'string',
          component: 'select',
          componentProps: {
            options: [
              { label: 'Admin', value: 'admin' },
              { label: 'User', value: 'user' },
            ],
          },
        },
        notes: { type: 'string' },
      },
    })

    expect(schema.properties.name.component).toBe('input')
    expect(schema.properties.role.component).toBe('select')
    expect(schema.properties.notes.component).toBeUndefined()
  })
})

describe('Registry merge via spread', () => {
  it('merges registries preserving all entries', () => {
    const baseRegistry = defineComponentRegistry({
      input: z.object({ placeholder: z.string().optional() }),
      select: z.object({ options: z.array(z.any()) }),
    })

    const customSchema = z.object({
      format: z.enum(['json', 'xml']).optional(),
    })

    const merged = defineComponentRegistry({
      ...baseRegistry,
      custom: customSchema,
    })

    expect(merged.input).toBeDefined()
    expect(merged.select).toBeDefined()
    expect(merged.custom).toBeDefined()
    expect(merged.custom.parse({ format: 'json' })).toEqual({ format: 'json' })
  })

  it('overwrites existing registry entries via spread', () => {
    const base = defineComponentRegistry({
      input: z.object({ placeholder: z.string().optional() }),
    })

    const extended = defineComponentRegistry({
      ...base,
      input: z.object({ placeholder: z.string(), maxLength: z.number().optional() }),
    })

    // Extended input now requires placeholder
    expect(() => extended.input.parse({})).toThrow()
    expect(extended.input.parse({ placeholder: 'hello' })).toEqual({
      placeholder: 'hello',
    })
  })
})

describe('WrapFieldSchema type', () => {
  const registry = defineComponentRegistry({
    input: z.object({ placeholder: z.string().optional() }),
  })

  type TestRegistry = typeof registry
  type WrappedField = WrapFieldSchema<TestRegistry>

  it('accepts typed component props for known component', () => {
    const field: WrappedField = {
      type: 'string',
      component: 'input',
      componentProps: { placeholder: 'Enter text' },
    }
    expect(field.component).toBe('input')
    expect(field.componentProps).toEqual({ placeholder: 'Enter text' })
  })

  it('accepts field without component (fallback)', () => {
    const field: WrappedField = {
      type: 'string',
    }
    acceptType(field)
    expect(field.type).toBe('string')
    expect(field.component).toBeUndefined()
  })

  it('accepts field with unknown component and arbitrary props (fallback)', () => {
    const field: WrappedField = {
      type: 'string',
      component: 'unknown-widget',
      componentProps: { any: 'thing', count: 42 },
    }
    acceptType(field)
    expect(field.component).toBe('unknown-widget')
  })

  it('accepts all standard FieldSchema fields alongside typed component', () => {
    const field: WrappedField = {
      type: 'string',
      title: 'Name',
      description: 'Enter your name',
      default: 'John',
      component: 'input',
      componentProps: { placeholder: 'Name' },
      visible: true,
      disabled: false,
      required: true,
      placeholder: 'Your name',
      labelPosition: 'top',
      labelWidth: '120px',
    }
    acceptType(field)
    expect(field.title).toBe('Name')
    expect(field.required).toBe(true)
    expect(field.labelPosition).toBe('top')
  })
})

describe('ComponentPropsRegistry type', () => {
  it('is a record of string to zod schemas', () => {
    const reg: ComponentPropsRegistry = {
      input: z.object({ placeholder: z.string() }),
      'date-picker': z.object({ format: z.string() }),
    }

    expect(Object.keys(reg)).toHaveLength(2)
    expect(reg.input.parse({ placeholder: 'test' })).toEqual({ placeholder: 'test' })
    expect(reg['date-picker'].parse({ format: 'YYYY-MM-DD' })).toEqual({
      format: 'YYYY-MM-DD',
    })
  })
})
