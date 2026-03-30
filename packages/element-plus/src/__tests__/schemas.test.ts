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
import { ratePropsSchema } from '../schemas/rate'
import { colorPickerPropsSchema } from '../schemas/color-picker'
import { treeSelectPropsSchema } from '../schemas/tree-select'
import { autocompletePropsSchema } from '../schemas/autocomplete'
import { checkboxGroupPropsSchema } from '../schemas/checkbox-group'
import { uploadPropsSchema } from '../schemas/upload'
import { elementPlusRegistry } from '../schemas'
import { defineComponentRegistry, defineFormSchema } from '@d-form/shared'

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

// Batch 3 schemas
const batch3Schemas = {
  rate: ratePropsSchema,
  'color-picker': colorPickerPropsSchema,
  'tree-select': treeSelectPropsSchema,
  autocomplete: autocompletePropsSchema,
  'checkbox-group': checkboxGroupPropsSchema,
  upload: uploadPropsSchema,
} as const

describe('Batch 3 schemas — valid input', () => {
  it('rate: parses valid props', () => {
    const result = ratePropsSchema.parse({
      max: 10,
      allowHalf: true,
      showScore: true,
      showText: false,
      scoreTemplate: '{value}',
      colors: ['#99A9BF', '#F7BA2A', '#FF9900'],
    })
    expect(result.max).toBe(10)
    expect(result.allowHalf).toBe(true)
    expect(result.colors).toHaveLength(3)
  })

  it('rate: parses empty object', () => {
    const result = ratePropsSchema.parse({})
    expect(result).toEqual({})
  })

  it('color-picker: parses valid props', () => {
    const result = colorPickerPropsSchema.parse({
      showAlpha: true,
      colorFormat: 'hex',
      size: 'small',
      predefine: ['#ff4500', '#ff8c00', '#ffd700'],
    })
    expect(result.showAlpha).toBe(true)
    expect(result.colorFormat).toBe('hex')
    expect(result.predefine).toHaveLength(3)
  })

  it('color-picker: parses empty object', () => {
    const result = colorPickerPropsSchema.parse({})
    expect(result).toEqual({})
  })

  it('tree-select: parses valid props', () => {
    const result = treeSelectPropsSchema.parse({
      data: [{ label: 'Node 1', value: 1 }],
      placeholder: 'Select node',
      clearable: true,
      multiple: false,
      checkStrictly: true,
      renderAfterExpand: false,
      lazy: true,
      nodeKey: 'id',
    })
    expect(result.data).toHaveLength(1)
    expect(result.checkStrictly).toBe(true)
    expect(result.nodeKey).toBe('id')
  })

  it('tree-select: parses empty object', () => {
    const result = treeSelectPropsSchema.parse({})
    expect(result).toEqual({})
  })

  it('autocomplete: parses valid props', () => {
    const result = autocompletePropsSchema.parse({
      placeholder: 'Search...',
      clearable: true,
      triggerOnFocus: false,
      placement: 'bottom-start',
      debounce: 300,
      valueKey: 'name',
    })
    expect(result.debounce).toBe(300)
    expect(result.placement).toBe('bottom-start')
  })

  it('autocomplete: parses empty object', () => {
    const result = autocompletePropsSchema.parse({})
    expect(result).toEqual({})
  })

  it('checkbox-group: parses valid props with options', () => {
    const result = checkboxGroupPropsSchema.parse({
      options: [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 2, disabled: true },
      ],
      min: 1,
      max: 3,
      size: 'small',
      border: true,
    })
    expect(result.options).toHaveLength(2)
    expect(result.options![1].disabled).toBe(true)
    expect(result.min).toBe(1)
    expect(result.border).toBe(true)
  })

  it('checkbox-group: parses empty object', () => {
    const result = checkboxGroupPropsSchema.parse({})
    expect(result).toEqual({})
  })

  it('upload: parses valid props', () => {
    const result = uploadPropsSchema.parse({
      action: '/api/upload',
      multiple: true,
      drag: false,
      accept: '.jpg,.png',
      listType: 'picture-card',
      autoUpload: false,
      limit: 5,
      data: { type: 'avatar' },
      headers: { Authorization: 'Bearer token' },
      name: 'file',
      withCredentials: true,
    })
    expect(result.action).toBe('/api/upload')
    expect(result.listType).toBe('picture-card')
    expect(result.limit).toBe(5)
    expect(result.headers).toEqual({ Authorization: 'Bearer token' })
  })

  it('upload: parses empty object', () => {
    const result = uploadPropsSchema.parse({})
    expect(result).toEqual({})
  })
})

describe('Batch 3 schemas — invalid input', () => {
  it('rate: rejects non-number max', () => {
    expect(() => ratePropsSchema.parse({ max: 'five' })).toThrow(z.ZodError)
  })

  it('rate: rejects non-boolean allowHalf', () => {
    expect(() => ratePropsSchema.parse({ allowHalf: 'yes' })).toThrow(z.ZodError)
  })

  it('rate: rejects non-array colors', () => {
    expect(() => ratePropsSchema.parse({ colors: 'red' })).toThrow(z.ZodError)
  })

  it('color-picker: rejects invalid colorFormat', () => {
    expect(() => colorPickerPropsSchema.parse({ colorFormat: 'cmyk' })).toThrow(z.ZodError)
  })

  it('color-picker: rejects invalid size', () => {
    expect(() => colorPickerPropsSchema.parse({ size: 'huge' })).toThrow(z.ZodError)
  })

  it('tree-select: rejects non-boolean multiple', () => {
    expect(() => treeSelectPropsSchema.parse({ multiple: 'yes' })).toThrow(z.ZodError)
  })

  it('tree-select: rejects non-string nodeKey', () => {
    expect(() => treeSelectPropsSchema.parse({ nodeKey: 123 })).toThrow(z.ZodError)
  })

  it('autocomplete: rejects invalid placement', () => {
    expect(() => autocompletePropsSchema.parse({ placement: 'middle' })).toThrow(z.ZodError)
  })

  it('autocomplete: rejects non-number debounce', () => {
    expect(() => autocompletePropsSchema.parse({ debounce: 'fast' })).toThrow(z.ZodError)
  })

  it('checkbox-group: rejects options without label', () => {
    expect(() => checkboxGroupPropsSchema.parse({ options: [{ value: 'a' }] })).toThrow(z.ZodError)
  })

  it('checkbox-group: rejects invalid size', () => {
    expect(() => checkboxGroupPropsSchema.parse({ size: 'huge' })).toThrow(z.ZodError)
  })

  it('upload: rejects invalid listType', () => {
    expect(() => uploadPropsSchema.parse({ listType: 'gallery' })).toThrow(z.ZodError)
  })

  it('upload: rejects non-number limit', () => {
    expect(() => uploadPropsSchema.parse({ limit: 'five' })).toThrow(z.ZodError)
  })
})

describe('Reserved props not in batch 3 schemas', () => {
  for (const [name, schema] of Object.entries(batch3Schemas)) {
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

  it('upload: does not contain fileList or file-list', () => {
    const shape = (uploadPropsSchema as z.ZodObject<z.ZodRawShape>).shape
    expect(shape.fileList).toBeUndefined()
    expect(shape['file-list']).toBeUndefined()
  })
})

describe('elementPlusRegistry', () => {
  it('has exactly 18 component schemas', () => {
    expect(Object.keys(elementPlusRegistry)).toHaveLength(18)
  })

  it('contains all expected component keys', () => {
    const expectedKeys = [
      'input',
      'select',
      'date-picker',
      'checkbox',
      'radio',
      'switch',
      'input-number',
      'textarea',
      'time-picker',
      'time-select',
      'cascader',
      'slider',
      'rate',
      'color-picker',
      'tree-select',
      'autocomplete',
      'checkbox-group',
      'upload',
    ]

    for (const key of expectedKeys) {
      expect(elementPlusRegistry[key]).toBeDefined()
    }
  })

  it('registry keys match registration names exactly', () => {
    const registryKeys = Object.keys(elementPlusRegistry).sort()
    const expectedKeys = [
      'autocomplete',
      'cascader',
      'checkbox',
      'checkbox-group',
      'color-picker',
      'date-picker',
      'input',
      'input-number',
      'radio',
      'rate',
      'select',
      'slider',
      'switch',
      'textarea',
      'time-picker',
      'time-select',
      'tree-select',
      'upload',
    ].sort()

    expect(registryKeys).toEqual(expectedKeys)
  })

  it('all registry schemas parse correctly', () => {
    const inputResult = elementPlusRegistry.input.parse({ placeholder: 'Test' })
    expect(inputResult.placeholder).toBe('Test')

    const rateResult = elementPlusRegistry.rate.parse({ max: 5, allowHalf: true })
    expect(rateResult.max).toBe(5)

    const uploadResult = elementPlusRegistry.upload.parse({ action: '/upload' })
    expect(uploadResult.action).toBe('/upload')
  })

  it('works with defineFormSchema integration', () => {
    const schema = defineFormSchema(elementPlusRegistry, {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          component: 'input',
          componentProps: { placeholder: 'Enter name' },
        },
        rating: {
          type: 'number',
          component: 'rate',
          componentProps: { max: 5, allowHalf: true },
        },
        color: {
          type: 'string',
          component: 'color-picker',
          componentProps: { showAlpha: true },
        },
      },
    })

    expect(schema.type).toBe('object')
    expect(schema.properties).toBeDefined()
  })
})
