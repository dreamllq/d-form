import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FormAgentBus } from '../bus'
import { createGenerateSchemaTool } from '../tools/generate-schema'
import { elementPlusRegistry } from '@d-form/element-plus'

describe('generate_form_schema tool', () => {
  let bus: FormAgentBus
  let tool: ReturnType<typeof createGenerateSchemaTool>

  beforeEach(() => {
    bus = new FormAgentBus()
    tool = createGenerateSchemaTool(elementPlusRegistry, bus)
  })

  it('has correct name and description', () => {
    expect(tool.name).toBe('generate_form_schema')
    expect(tool.description).toContain('form schema')
  })

  it('valid complete FormSchema → emits on bus and returns success', async () => {
    const listener = vi.fn()
    bus.on('schema:change', listener)

    const result = await tool.execute({
      type: 'object',
      properties: {
        name: { type: 'string', component: 'input' },
        age: { type: 'number', component: 'input-number' },
      },
    })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(result).toContain('successfully')
    expect(result).toContain('2 fields')
  })

  it('invalid schema (wrong component name) → returns error, bus NOT called', async () => {
    const listener = vi.fn()
    bus.on('schema:change', listener)

    const result = await tool.execute({
      type: 'object',
      properties: {
        name: { type: 'string', component: 'nonexistent-component' },
      },
    })

    expect(listener).not.toHaveBeenCalled()
    expect(result).toContain('validation failed')
  })

  it('invalid schema (missing type: object) → returns validation error', async () => {
    const listener = vi.fn()
    bus.on('schema:change', listener)

    const result = await tool.execute({
      properties: { name: { type: 'string', component: 'input' } },
    })

    expect(listener).not.toHaveBeenCalled()
    expect(result).toContain('validation failed')
  })

  it('empty properties → valid, bus emits, returns "0 fields"', async () => {
    const listener = vi.fn()
    bus.on('schema:change', listener)

    const result = await tool.execute({
      type: 'object',
      properties: {},
    })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(result).toContain('0 fields')
  })

  it('schema with nested object → valid, bus emits', async () => {
    const listener = vi.fn()
    bus.on('schema:change', listener)

    const result = await tool.execute({
      type: 'object',
      properties: {
        address: {
          type: 'object',
          component: 'input',
          properties: {
            street: { type: 'string', component: 'input' },
          },
        },
      },
    })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(result).toContain('successfully')
  })

  it('schema with array field → valid, bus emits', async () => {
    const listener = vi.fn()
    bus.on('schema:change', listener)

    const result = await tool.execute({
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          component: 'input',
          items: { type: 'string' },
        },
      },
    })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(result).toContain('successfully')
  })

  it('schema with wrong componentProps → error with field path', async () => {
    const listener = vi.fn()
    bus.on('schema:change', listener)

    // maxlength is z.number() in inputPropsSchema — passing a string must fail
    const result = await tool.execute({
      type: 'object',
      properties: {
        name: {
          type: 'string',
          component: 'input',
          componentProps: { maxlength: 'not-a-number' },
        },
      },
    })

    expect(listener).not.toHaveBeenCalled()
    expect(result).toContain('validation failed')
  })
})
