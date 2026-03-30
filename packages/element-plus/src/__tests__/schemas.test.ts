import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { inputPropsSchema } from '../schemas/input'
import { selectPropsSchema } from '../schemas/select'
import { datePickerPropsSchema } from '../schemas/date-picker'
import { checkboxPropsSchema } from '../schemas/checkbox'
import { radioPropsSchema } from '../schemas/radio'
import { switchPropsSchema } from '../schemas/switch'
import { inputNumberPropsSchema } from '../schemas/input-number'
import { textareaPropsSchema } from '../schemas/textarea'
import { timePickerPropsSchema } from '../schemas/time-picker'
import { timeSelectPropsSchema } from '../schemas/time-select'
import { cascaderPropsSchema } from '../schemas/cascader'
import { sliderPropsSchema } from '../schemas/slider'
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

// Batch 2 schemas
const batch2Schemas = {
  'input-number': inputNumberPropsSchema,
  textarea: textareaPropsSchema,
  'time-picker': timePickerPropsSchema,
  'time-select': timeSelectPropsSchema,
  cascader: cascaderPropsSchema,
  slider: sliderPropsSchema,
} as const

describe('Batch 2 schemas — valid input', () => {
  it('input-number: parses valid props', () => {
    const result = inputNumberPropsSchema.parse({
      min: 0,
      max: 100,
      step: 5,
      precision: 2,
      size: 'small',
      controls: true,
      controlsPosition: 'right',
      placeholder: 'Enter number',
    })
    expect(result.min).toBe(0)
    expect(result.max).toBe(100)
    expect(result.step).toBe(5)
    expect(result.precision).toBe(2)
  })

  it('input-number: parses empty object', () => {
    const result = inputNumberPropsSchema.parse({})
    expect(result).toEqual({})
  })

  it('textarea: parses valid props with boolean autosize', () => {
    const result = textareaPropsSchema.parse({
      rows: 4,
      autosize: true,
      showWordLimit: true,
      maxlength: 500,
      placeholder: 'Enter text',
      readonly: false,
      resize: 'vertical',
    })
    expect(result.rows).toBe(4)
    expect(result.autosize).toBe(true)
    expect(result.maxlength).toBe(500)
  })

  it('textarea: parses autosize as object', () => {
    const result = textareaPropsSchema.parse({
      autosize: { minRows: 2, maxRows: 6 },
    })
    expect(result.autosize).toEqual({ minRows: 2, maxRows: 6 })
  })

  it('time-picker: parses valid props', () => {
    const result = timePickerPropsSchema.parse({
      placeholder: 'Pick a time',
      clearable: true,
      format: 'HH:mm',
      valueFormat: 'HH:mm:ss',
      isRange: false,
    })
    expect(result.format).toBe('HH:mm')
    expect(result.isRange).toBe(false)
  })

  it('time-select: parses valid props', () => {
    const result = timeSelectPropsSchema.parse({
      placeholder: 'Select time',
      clearable: true,
      start: '08:00',
      end: '20:00',
      step: '00:30',
      minTime: '06:00',
      maxTime: '22:00',
    })
    expect(result.start).toBe('08:00')
    expect(result.step).toBe('00:30')
  })

  it('cascader: parses valid props with options', () => {
    const result = cascaderPropsSchema.parse({
      options: [
        {
          label: 'Guide',
          value: 'guide',
          children: [
            { label: 'Disciplines', value: 'disciplines' },
            { label: 'Consistency', value: 'consistency' },
          ],
        },
      ],
      placeholder: 'Select',
      clearable: true,
      filterable: true,
      multiple: false,
      separator: ' / ',
      showAllLevels: true,
    })
    expect(result.options).toHaveLength(1)
    expect(result.options![0].children).toHaveLength(2)
    expect(result.separator).toBe(' / ')
  })

  it('cascader: parses props config', () => {
    const result = cascaderPropsSchema.parse({
      props: { checkStrictly: true, emitPath: false },
    })
    expect(result.props).toEqual({ checkStrictly: true, emitPath: false })
  })

  it('slider: parses valid props', () => {
    const result = sliderPropsSchema.parse({
      min: 0,
      max: 100,
      step: 10,
      range: true,
      showInput: true,
      showStops: true,
      showTooltip: false,
    })
    expect(result.range).toBe(true)
    expect(result.step).toBe(10)
    expect(result.showTooltip).toBe(false)
  })

  it('slider: parses empty object', () => {
    const result = sliderPropsSchema.parse({})
    expect(result).toEqual({})
  })
})

describe('Batch 2 schemas — invalid input', () => {
  it('input-number: rejects non-number min', () => {
    expect(() => inputNumberPropsSchema.parse({ min: 'abc' })).toThrow(z.ZodError)
  })

  it('input-number: rejects invalid size', () => {
    expect(() => inputNumberPropsSchema.parse({ size: 'huge' })).toThrow(z.ZodError)
  })

  it('input-number: rejects non-boolean controls', () => {
    expect(() => inputNumberPropsSchema.parse({ controls: 'yes' })).toThrow(z.ZodError)
  })

  it('textarea: rejects non-number rows', () => {
    expect(() => textareaPropsSchema.parse({ rows: 'many' })).toThrow(z.ZodError)
  })

  it('textarea: rejects invalid autosize value', () => {
    expect(() => textareaPropsSchema.parse({ autosize: { minRows: 'abc' } })).toThrow(z.ZodError)
  })

  it('textarea: rejects invalid resize', () => {
    expect(() => textareaPropsSchema.parse({ resize: 'diagonal' })).toThrow(z.ZodError)
  })

  it('time-picker: rejects non-boolean isRange', () => {
    expect(() => timePickerPropsSchema.parse({ isRange: 'yes' })).toThrow(z.ZodError)
  })

  it('time-select: rejects non-string step', () => {
    expect(() => timeSelectPropsSchema.parse({ step: 30 })).toThrow(z.ZodError)
  })

  it('cascader: rejects options without label', () => {
    expect(() => cascaderPropsSchema.parse({ options: [{ value: 'a' }] })).toThrow(z.ZodError)
  })

  it('cascader: rejects non-boolean filterable', () => {
    expect(() => cascaderPropsSchema.parse({ filterable: 'yes' })).toThrow(z.ZodError)
  })

  it('slider: rejects non-number step', () => {
    expect(() => sliderPropsSchema.parse({ step: 'ten' })).toThrow(z.ZodError)
  })

  it('slider: rejects non-boolean range', () => {
    expect(() => sliderPropsSchema.parse({ range: 'yes' })).toThrow(z.ZodError)
  })
})

describe('Reserved props not in batch 2 schemas', () => {
  for (const [name, schema] of Object.entries(batch2Schemas)) {
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

describe('Batch 2 schemas work with defineComponentRegistry', () => {
  it('all batch 2 schemas can be registered', () => {
    const registry = defineComponentRegistry({
      'input-number': inputNumberPropsSchema,
      textarea: textareaPropsSchema,
      'time-picker': timePickerPropsSchema,
      'time-select': timeSelectPropsSchema,
      cascader: cascaderPropsSchema,
      slider: sliderPropsSchema,
    })

    expect(Object.keys(registry)).toHaveLength(6)
    expect(registry['input-number']).toBe(inputNumberPropsSchema)
    expect(registry['time-picker']).toBe(timePickerPropsSchema)
  })

  it('registered batch 2 schemas parse correctly', () => {
    const registry = defineComponentRegistry({
      'input-number': inputNumberPropsSchema,
      textarea: textareaPropsSchema,
      'time-picker': timePickerPropsSchema,
      'time-select': timeSelectPropsSchema,
      cascader: cascaderPropsSchema,
      slider: sliderPropsSchema,
    })

    const numberResult = registry['input-number'].parse({
      min: 0,
      max: 999,
    })
    expect(numberResult.min).toBe(0)

    const sliderResult = registry.slider.parse({ range: true })
    expect(sliderResult.range).toBe(true)
  })
})
