import { defineComponentRegistry } from '@d-form/shared'
import { inputPropsSchema } from './input'
import { selectPropsSchema } from './select'
import { datePickerPropsSchema } from './date-picker'
import { checkboxPropsSchema } from './checkbox'
import { radioPropsSchema } from './radio'
import { switchPropsSchema } from './switch'
import { inputNumberPropsSchema } from './input-number'
import { textareaPropsSchema } from './textarea'
import { timePickerPropsSchema } from './time-picker'
import { timeSelectPropsSchema } from './time-select'
import { cascaderPropsSchema } from './cascader'
import { sliderPropsSchema } from './slider'
import { ratePropsSchema } from './rate'
import { colorPickerPropsSchema } from './color-picker'
import { treeSelectPropsSchema } from './tree-select'
import { autocompletePropsSchema } from './autocomplete'
import { checkboxGroupPropsSchema } from './checkbox-group'
import { uploadPropsSchema } from './upload'

export const elementPlusRegistry = defineComponentRegistry({
  input: inputPropsSchema,
  select: selectPropsSchema,
  'date-picker': datePickerPropsSchema,
  checkbox: checkboxPropsSchema,
  radio: radioPropsSchema,
  switch: switchPropsSchema,
  'input-number': inputNumberPropsSchema,
  textarea: textareaPropsSchema,
  'time-picker': timePickerPropsSchema,
  'time-select': timeSelectPropsSchema,
  cascader: cascaderPropsSchema,
  slider: sliderPropsSchema,
  rate: ratePropsSchema,
  'color-picker': colorPickerPropsSchema,
  'tree-select': treeSelectPropsSchema,
  autocomplete: autocompletePropsSchema,
  'checkbox-group': checkboxGroupPropsSchema,
  upload: uploadPropsSchema,
})

// Re-export all schemas
export { inputPropsSchema } from './input'
export { selectPropsSchema } from './select'
export { datePickerPropsSchema } from './date-picker'
export { checkboxPropsSchema } from './checkbox'
export { radioPropsSchema } from './radio'
export { switchPropsSchema } from './switch'
export { inputNumberPropsSchema } from './input-number'
export { textareaPropsSchema } from './textarea'
export { timePickerPropsSchema } from './time-picker'
export { timeSelectPropsSchema } from './time-select'
export { cascaderPropsSchema } from './cascader'
export { sliderPropsSchema } from './slider'
export { ratePropsSchema } from './rate'
export { colorPickerPropsSchema } from './color-picker'
export { treeSelectPropsSchema } from './tree-select'
export { autocompletePropsSchema } from './autocomplete'
export { checkboxGroupPropsSchema } from './checkbox-group'
export { uploadPropsSchema } from './upload'
