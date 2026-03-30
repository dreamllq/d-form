import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { inputPropsSchema } from '../schemas/input'
import { selectPropsSchema } from '../schemas/select'
import { datePickerPropsSchema } from '../schemas/date-picker'
import { checkboxPropsSchema } from '../schemas/checkbox'
import { radioPropsSchema } from '../schemas/radio'
import { switchPropsSchema } from '../schemas/switch'
import { defineComponentRegistry } from '@d-form/shared'

// Reserved props that must NOT appear in any schema
const RESERVED_PROPS = ['modelValue', 'model-value', 'disabled', 'class']

// All batch 1 schemas
const schemas = {
  input: inputPropsSchema,
  select: selectPropsSchema,
  'date-picker': datePickerPropsSchema,
  checkbox: checkboxPropsSchema,
  radio: radioPropsSchema,
  switch: switchPropsSchema,
} as const

describe('Batch 1 schemas — valid input', () => {
  it('input: parses valid props', () => {
    const result = inputPropsSchema.parse({
      placeholder: 'Enter text',
      maxlength: 100,
      clearable: true,
      showWordLimit: true,
      size: 'small',
      type: 'password',
    })
    expect(result.placeholder).toBe('Enter text')
    expect(result.maxlength).toBe(100)
    expect(result.clearable).toBe(true)
  })

  it('input: parses empty object', () => {
    const result = inputPropsSchema.parse({})
    expect(result).toEqual({})
  })

  it('select: parses valid props with options', () => {
    const result = selectPropsSchema.parse({
      placeholder: 'Choose',
      clearable: true,
      multiple: false,
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 2, disabled: true },
      ],
    })
    expect(result.options).toHaveLength(2)
    expect(result.options![1].value).toBe(2)
  })

  it('date-picker: parses valid props', () => {
    const result = datePickerPropsSchema.parse({
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm',
      valueFormat: 'YYYY-MM-DDTHH:mm:ss',
      placeholder: 'Pick a date',
      clearable: false,
    })
    expect(result.type).toBe('datetime')
  })

  it('checkbox: parses valid props', () => {
    const result = checkboxPropsSchema.parse({
      label: 'Accept terms',
      trueValue: 'yes',
      falseValue: 'no',
      border: true,
    })
    expect(result.label).toBe('Accept terms')
    expect(result.trueValue).toBe('yes')
  })

  it('radio: parses valid props with options', () => {
    const result = radioPropsSchema.parse({
      options: [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b', disabled: true },
      ],
      border: true,
      size: 'large',
    })
    expect(result.options).toHaveLength(2)
  })

  it('switch: parses valid props', () => {
    const result = switchPropsSchema.parse({
      activeText: 'On',
      inactiveText: 'Off',
      activeColor: '#13ce66',
      inactiveColor: '#ff4949',
      width: 60,
    })
    expect(result.activeText).toBe('On')
    expect(result.width).toBe(60)
  })
})

describe('Batch 1 schemas — invalid input', () => {
  it('input: rejects invalid size', () => {
    expect(() => inputPropsSchema.parse({ size: 'huge' })).toThrow(z.ZodError)
  })

  it('input: rejects non-number maxlength', () => {
    expect(() => inputPropsSchema.parse({ maxlength: 'abc' })).toThrow(z.ZodError)
  })

  it('select: rejects invalid options shape', () => {
    expect(() => selectPropsSchema.parse({ options: [{ bad: 'shape' }] })).toThrow(z.ZodError)
  })

  it('select: rejects non-boolean multiple', () => {
    expect(() => selectPropsSchema.parse({ multiple: 'yes' })).toThrow(z.ZodError)
  })

  it('date-picker: rejects invalid type', () => {
    expect(() => datePickerPropsSchema.parse({ type: 'invalid' })).toThrow(z.ZodError)
  })

  it('checkbox: rejects non-boolean border', () => {
    expect(() => checkboxPropsSchema.parse({ border: 'yes' })).toThrow(z.ZodError)
  })

  it('radio: rejects options without label', () => {
    expect(() => radioPropsSchema.parse({ options: [{ value: 'a' }] })).toThrow(z.ZodError)
  })

  it('switch: rejects non-number width', () => {
    expect(() => switchPropsSchema.parse({ width: 'wide' })).toThrow(z.ZodError)
  })
})

describe('Reserved props not in schemas', () => {
  for (const [name, schema] of Object.entries(schemas)) {
    it(`${name}: does not contain reserved props`, () => {
      const shape = (schema as z.ZodObject<z.ZodRawShape>).shape
      for (const reserved of RESERVED_PROPS) {
        expect(
          shape[reserved],
          `${name} schema contains reserved prop "${reserved}"`
        ).toBeUndefined()
      }
    })
  }
})

describe('Schemas work with defineComponentRegistry', () => {
  it('all batch 1 schemas can be registered', () => {
    const registry = defineComponentRegistry({
      input: inputPropsSchema,
      select: selectPropsSchema,
      'date-picker': datePickerPropsSchema,
      checkbox: checkboxPropsSchema,
      radio: radioPropsSchema,
      switch: switchPropsSchema,
    })

    expect(Object.keys(registry)).toHaveLength(6)
    expect(registry.input).toBe(inputPropsSchema)
    expect(registry['date-picker']).toBe(datePickerPropsSchema)
  })

  it('registered schemas parse correctly', () => {
    const registry = defineComponentRegistry({
      input: inputPropsSchema,
      select: selectPropsSchema,
      'date-picker': datePickerPropsSchema,
      checkbox: checkboxPropsSchema,
      radio: radioPropsSchema,
      switch: switchPropsSchema,
    })

    const inputResult = registry.input.parse({ placeholder: 'Test' })
    expect(inputResult.placeholder).toBe('Test')

    const selectResult = registry.select.parse({
      options: [{ label: 'X', value: 1 }],
    })
    expect(selectResult.options).toHaveLength(1)
  })
})
