export * from '@d-form/vue'

import { registerComponent } from '@d-form/vue'
import InputAdapter from './adapters/InputAdapter.vue'
import SelectAdapter from './adapters/SelectAdapter.vue'
import DatePickerAdapter from './adapters/DatePickerAdapter.vue'
import CheckboxAdapter from './adapters/CheckboxAdapter.vue'
import RadioAdapter from './adapters/RadioAdapter.vue'
import SwitchAdapter from './adapters/SwitchAdapter.vue'
import InputNumberAdapter from './adapters/InputNumberAdapter.vue'
import TextareaAdapter from './adapters/TextareaAdapter.vue'
import TimePickerAdapter from './adapters/TimePickerAdapter.vue'
import TimeSelectAdapter from './adapters/TimeSelectAdapter.vue'
import CascaderAdapter from './adapters/CascaderAdapter.vue'
import SliderAdapter from './adapters/SliderAdapter.vue'
import RateAdapter from './adapters/RateAdapter.vue'
import ColorPickerAdapter from './adapters/ColorPickerAdapter.vue'
import TreeSelectAdapter from './adapters/TreeSelectAdapter.vue'
import AutocompleteAdapter from './adapters/AutocompleteAdapter.vue'
import CheckboxGroupAdapter from './adapters/CheckboxGroupAdapter.vue'
import UploadAdapter from './adapters/UploadAdapter.vue'

export {
  InputAdapter,
  SelectAdapter,
  DatePickerAdapter,
  CheckboxAdapter,
  RadioAdapter,
  SwitchAdapter,
  InputNumberAdapter,
  TextareaAdapter,
  TimePickerAdapter,
  TimeSelectAdapter,
  CascaderAdapter,
  SliderAdapter,
  RateAdapter,
  ColorPickerAdapter,
  TreeSelectAdapter,
  AutocompleteAdapter,
  CheckboxGroupAdapter,
  UploadAdapter,
}

/**
 * Register all Element Plus adapters with the @d-form/vue renderer
 * Call this function once at application startup
 */
export function registerElementPlusComponents(): void {
  registerComponent('input', InputAdapter)
  registerComponent('select', SelectAdapter)
  registerComponent('date-picker', DatePickerAdapter)
  registerComponent('checkbox', CheckboxAdapter)
  registerComponent('radio', RadioAdapter)
  registerComponent('switch', SwitchAdapter)
  registerComponent('input-number', InputNumberAdapter)
  registerComponent('textarea', TextareaAdapter)
  registerComponent('time-picker', TimePickerAdapter)
  registerComponent('time-select', TimeSelectAdapter)
  registerComponent('cascader', CascaderAdapter)
  registerComponent('slider', SliderAdapter)
  registerComponent('rate', RateAdapter)
  registerComponent('color-picker', ColorPickerAdapter)
  registerComponent('tree-select', TreeSelectAdapter)
  registerComponent('autocomplete', AutocompleteAdapter)
  registerComponent('checkbox-group', CheckboxGroupAdapter)
  registerComponent('upload', UploadAdapter)
}
