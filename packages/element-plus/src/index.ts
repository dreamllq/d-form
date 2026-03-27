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

export {
  InputAdapter,
  SelectAdapter,
  DatePickerAdapter,
  CheckboxAdapter,
  RadioAdapter,
  SwitchAdapter,
  InputNumberAdapter,
  TextareaAdapter
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
}
