# API Reference

This document covers every public API across the four d-form packages.

## @d-form/shared

The base package with types, utilities, and i18n.

### Types

#### `FormSchema<T>`

Describes an entire form.

```ts
interface FormSchema<T = Record<string, any>> {
  type: 'object' // Always 'object' for forms
  properties: Record<string, FieldSchema> // Field definitions
  uiSchema?: UISchema // Layout and display config
  reactions?: ReactionSchema[] // Form-level reactions
  title?: string // Form title
  description?: string // Form description
  default?: T // Default values
}
```

#### `UISchema`

Controls form layout and appearance.

```ts
interface UISchema {
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelWidth?: string | number // e.g. '100px' or 100
  gutter?: number // Spacing between fields
  columns?: number // Grid columns
  size?: 'small' | 'default' | 'large'
  labelPosition?: 'left' | 'right' | 'top'
  colon?: boolean // Show colon after labels
  showRequiredAsterisk?: boolean // Show * for required fields
}
```

#### `FieldSchema<T>`

Describes a single field.

```ts
interface FieldSchema<T = any> {
  type: FieldType | string // 'string', 'number', 'boolean', etc.
  key?: string // Field path override
  title?: string // Display label
  description?: string // Help text
  default?: T // Default value
  component?: string // Component name for rendering
  componentProps?: Record<string, any> // Extra component props
  validation?: ValidationConfig // Validation rules
  reactions?: ReactionConfig[] // Field-level reactions
  visible?: boolean // Initial visibility
  disabled?: boolean // Initial disabled state
  placeholder?: string // Input placeholder
  required?: boolean // Show required marker
  enum?: Array<{ label: string; value: any }> | any[] // Select/radio options
  properties?: Record<string, FieldSchema> // Nested fields (object type)
  items?: FieldSchema // Array item schema (array type)
}
```

#### `FieldType`

```ts
type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date' | 'void'
```

#### `FieldState<T>`

Runtime state of a field.

```ts
interface FieldState<T = any> {
  value: T
  error?: string
  touched: boolean
  dirty: boolean
  visible: boolean
  disabled: boolean
  validating: boolean
  loading?: boolean
  displayValue?: any
}
```

#### `FormState<T>`

Runtime state of the whole form.

```ts
interface FormState<T = Record<string, any>> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  dirty: boolean
  submitting: boolean
  isValid: boolean
  validating: boolean
  submitted: boolean
  submitCount: number
}
```

#### `ValidationRule`

A single validation constraint.

```ts
interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: any // Threshold value
  message?: string // Custom error message
  validator?: (value: any) => boolean | Promise<boolean> // For 'custom' type
}
```

#### `ValidationConfig`

```ts
interface ValidationConfig {
  rules?: ValidationRule[]
  validator?: string // Named validator reference
  trigger?: 'blur' | 'change' | 'submit' | Array<'blur' | 'change' | 'submit'>
  validateVisibleOnly?: boolean // Skip hidden fields
}
```

#### `ValidationResult`

```ts
interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
}
```

#### `FormValidationResult`

```ts
interface FormValidationResult {
  valid: boolean
  fields: Record<string, ValidationResult>
  errors: string[]
}
```

#### `ReactionConfig`

Defines field linkage behavior.

```ts
interface ReactionConfig {
  dependencies?: string[] // Field paths to watch
  target?: string | string[] // Fields to modify
  when?: string // Condition expression
  fulfill?: ReactionEffect // Apply when condition is true
  otherwise?: ReactionEffect // Apply when condition is false
}
```

#### `ReactionEffect`

```ts
interface ReactionEffect {
  state?: Partial<FieldState> // State changes to apply
  schema?: Partial<FieldSchema> // Schema changes to apply
  run?: string // Expression to execute
}
```

#### `FormOptions<T>`

```ts
interface FormOptions<T = Record<string, any>> {
  schema?: FormSchema<T>
  initialValues?: Partial<T>
  onSubmit?: (values: T) => Promise<void> | void
  onValuesChange?: (values: T, changedPath: string) => void
  validateOnMount?: boolean
  validateOnChange?: boolean
  validateOnBlur?: boolean
}
```

### Utility Functions

#### Path Operations

```ts
// Get a nested value by dot path
get(obj: any, path: string, defaultValue?: any): any

// Set a nested value by dot path
set(obj: any, path: string, value: any): any

// Check if a nested path exists
has(obj: any, path: string): boolean
```

#### Object Operations

```ts
// Deep clone (handles Date, RegExp, arrays, plain objects)
deepClone<T>(obj: T): T

// Deep merge plain objects (mutates target)
deepMerge<T>(target: T, ...sources: Partial<T>[]): T
```

#### Type Guards

```ts
isPlainObject(val: unknown): val is Record<string, any>
isArray(val: unknown): val is any[]
isFunction(val: unknown): val is Function
isString(val: unknown): val is string
isNumber(val: unknown): val is number
isBoolean(val: unknown): val is boolean
isNull(val: unknown): val is null
isUndefined(val: unknown): val is undefined
isSymbol(val: unknown): val is symbol
isBigInt(val: unknown): val is bigint
isObject(val: unknown): val is Record<string, any>
isDate(val: unknown): val is Date
isRegExp(val: unknown): val is RegExp
isEmpty(val: unknown): boolean  // null, undefined, empty arrays, empty strings, empty objects
```

### i18n

#### `createI18n(options?)`

Creates an i18n instance.

```ts
const i18n = createI18n({
  locale: 'en', // Default: 'en'
  fallbackLocale: 'en', // Default: 'en'
  messages: { en, zhCN }, // Pre-loaded locale messages
})
```

Returns an `II18n` instance with:

| Method / Property               | Signature                                               |
| ------------------------------- | ------------------------------------------------------- |
| `locale`                        | `string` (getter)                                       |
| `t(key, params?)`               | `(key: string, params?: Record<string, any>) => string` |
| `setLocale(locale)`             | `(locale: string) => void`                              |
| `addMessages(locale, messages)` | `(locale: string, messages: LocaleMessages) => void`    |

Bundled locale exports: `en`, `zhCN`.

---

## @d-form/core

The form engine. Re-exports everything from `@d-form/shared`.

### Form

#### `createForm(options?)`

Factory function. Creates a `Form` instance.

```ts
import { createForm } from '@d-form/core'

const form = createForm({
  schema: mySchema,
  initialValues: { name: 'John' },
  onSubmit: async (values) => {
    /* ... */
  },
  onValuesChange: (values, changedPath) => {
    /* ... */
  },
  validateOnBlur: true,
  validateOnChange: true,
})
```

Accepts `FormOptions` plus an optional `zodSchema` property for Zod-based validation.

#### Form Instance Methods

| Method                           | Signature                                            | Description                                           |
| -------------------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| `getState()`                     | `() => FormState`                                    | Get a snapshot of form state                          |
| `setState(partial)`              | `(partial: Partial<FormState>) => void`              | Merge state updates                                   |
| `getValues()`                    | `() => T`                                            | Get all form values (shallow copy)                    |
| `setValues(values)`              | `(values: T) => void`                                | Replace all values                                    |
| `getFieldValue(path)`            | `(path: string) => any`                              | Get a value by dot path                               |
| `setFieldValue(path, value)`     | `(path: string, value: any) => void`                 | Set a value and trigger change handlers               |
| `getFieldState(path)`            | `(path: string) => FieldState \| undefined`          | Get a field's state snapshot                          |
| `setFieldState(path, state)`     | `(path: string, state: Partial<FieldState>) => void` | Update a field's state                                |
| `getFieldError(path)`            | `(path: string) => string \| undefined`              | Get a field's error message                           |
| `setFieldError(path, error)`     | `(path: string, error: string \| undefined) => void` | Set or clear a field error                            |
| `getErrors()`                    | `() => Record<string, string>`                       | Get all field errors                                  |
| `setFieldTouched(path, touched)` | `(path: string, touched: boolean) => void`           | Mark a field as touched                               |
| `clearErrors()`                  | `() => void`                                         | Clear all errors on form and fields                   |
| `registerField(path, schema?)`   | `(path: string, schema?: FieldSchema) => Field`      | Register and return a field                           |
| `unregisterField(path)`          | `(path: string) => void`                             | Remove a field                                        |
| `hasField(path)`                 | `(path: string) => boolean`                          | Check if a field exists                               |
| `getField(path)`                 | `(path: string) => Field \| undefined`               | Get the Field instance                                |
| `getFieldNames()`                | `() => string[]`                                     | List all registered field paths                       |
| `getInitialValue(path)`          | `(path: string) => any`                              | Get the initial value for a path                      |
| `submit(onSubmit?)`              | `() => Promise<void>`                                | Validate and call onSubmit. Increments `submitCount`. |
| `reset()`                        | `() => void`                                         | Reset all fields to initial values, clear errors      |
| `validate()`                     | `() => Promise<FormValidationResult>`                | Validate all visible fields                           |
| `validateField(path)`            | `(path: string) => Promise<ValidationResult>`        | Validate a single field                               |

### Field

#### Field Instance Methods

| Method                  | Signature                                             | Description                                 |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------- |
| `getValue()`            | `() => any`                                           | Current value                               |
| `setValue(value)`       | `(value: any) => void`                                | Set value, mark dirty, emit events          |
| `getState()`            | `() => FieldState`                                    | State snapshot                              |
| `setState(partial)`     | `(partial: Partial<FieldState>) => void`              | Merge state                                 |
| `getError()`            | `() => string \| undefined`                           | Current error                               |
| `setError(error)`       | `(error: string \| undefined) => void`                | Set or clear error                          |
| `setTouched(touched)`   | `(touched: boolean) => void`                          | Set touched flag, triggers blur validation  |
| `setVisible(visible)`   | `(visible: boolean) => void`                          | Toggle visibility                           |
| `setDisabled(disabled)` | `(disabled: boolean) => void`                         | Toggle disabled                             |
| `reset()`               | `() => void`                                          | Reset to initial value                      |
| `validate()`            | `() => ValidationResult \| Promise<ValidationResult>` | Run validation rules                        |
| `on(event, callback)`   | `(event, cb) => () => void`                           | Subscribe to events, returns unsubscribe fn |

**Events:** `'valueChange'`, `'touchedChange'`, `'stateChange'`

**Field.meta** (read-only):

```ts
interface FieldMeta {
  path: string
  name: string // Last segment of path
  schema: FieldSchema
  parentPath?: string // For nested fields
  depth: number
}
```

### Reaction

#### `createReaction(form, sourceField, config)`

Creates and activates a `Reaction` instance that watches dependency fields and applies effects.

```ts
import { createReaction } from '@d-form/core'

const reaction = createReaction(form, 'country', {
  dependencies: ['country'],
  target: 'province',
  when: '{{$deps[0] === "CN"}}',
  fulfill: {
    state: { visible: true },
  },
  otherwise: {
    state: { visible: false },
  },
})

// Clean up when done
reaction.dispose()
```

| Method         | Description                       |
| -------------- | --------------------------------- |
| `run()`        | Manually trigger the reaction     |
| `dispose()`    | Unsubscribe from all dependencies |
| `isDisposed()` | Check if already disposed         |

### Validation Functions

#### `createValidator(rules)`

Creates a reusable validator function from an array of rules.

```ts
import { createValidator } from '@d-form/core'

const validateName = createValidator([
  { type: 'required', message: 'Name is required' },
  { type: 'minLength', value: 2, message: 'Too short' },
])

const result = validateName('A', 'name')
// { valid: false, errors: ['Too short'] }
```

#### `validateField(field, fieldName?)`

Validates a single `Field` instance. Returns sync or async depending on whether custom validators are present.

#### `validateForm(form)`

Validates all fields on a `Form` instance. Skips hidden fields when `validateVisibleOnly` is set.

### Zod Integration

```ts
import { validateWithZod, validateFormWithZod, createZodValidator } from '@d-form/core'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
})

// Whole-form validation
const result = await validateFormWithZod(schema, { email: 'bad', age: 10 })

// Single-field validation
const fieldResult = await validateFieldWithZod(schema, 'email', 'bad')

// Create a reusable validator
const validator = createZodValidator(schema)

// Error utilities
extractZodErrorMessages(zodError) // string[]
mapZodErrorsToFields(zodError) // Record<string, string[]>
isZodError(error) // boolean
getFirstError(result) // string | undefined
```

### Expression System

#### `compile(expression, scope, options?)`

Compiles and evaluates a `{{expression}}` string against a scope.

```ts
import { compile } from '@d-form/core'

compile('{{$self.value + 1}}', { $self: { value: 10 } })
// Returns: 11

compile('plain text', { $self: { value: 10 } })
// Returns: 'plain text' (not an expression, returned as-is)
```

#### `isExpression(str)`

```ts
isExpression('{{$self.value}}') // true
isExpression('hello') // false
```

#### `shallowCompile(source, scope, options?)`

Recursively compiles expressions in strings within objects and arrays.

```ts
shallowCompile({ label: '{{$self.name}}', value: 123 }, { $self: { name: 'John' } })
// { label: 'John', value: 123 }
```

#### `clearCache()`, `getCacheSize()`

Cache management for compiled expressions.

### Reactive System

```ts
import { observable, autorun } from '@d-form/core'

const state = observable({ count: 0 })

const dispose = autorun(() => {
  console.log(state.count) // Prints 0, then re-runs when count changes
})

state.count = 1 // Prints 1
```

| Export                 | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| `observable(target)`   | Wrap an object in a reactive Proxy                         |
| `autorun(runner)`      | Run a function, re-run when observed properties change     |
| `getCurrentReaction()` | Get the currently executing reaction (for manual tracking) |
| `Tracker`              | Low-level effect collection class                          |
| `clearAllTrackers()`   | Reset all dependency tracking                              |

---

## @d-form/vue

Vue 3 integration. Re-exports everything from `@d-form/core`.

### `useForm(schemaOrOptions?)`

The primary composable for form state management.

```ts
import { useForm } from '@d-form/vue'

// Pass a schema directly
const form = useForm({
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name', component: 'input' },
  },
})

// Or pass options
const form = useForm({
  schema: mySchema,
  initialValues: { name: 'John' },
  onSubmit: async (values) => {
    /* ... */
  },
  validateOnChange: true,
  zodSchema: myZodSchema,
})
```

**Returns:** `UseFormReturn<T>`

| Property      | Type                                 | Description                  |
| ------------- | ------------------------------------ | ---------------------------- |
| `form`        | `Form`                               | The underlying Form instance |
| `values`      | `T` (reactive)                       | Current form values          |
| `errors`      | `Record<string, string>` (reactive)  | Field errors                 |
| `touched`     | `Record<string, boolean>` (reactive) | Touched state                |
| `dirty`       | `Ref<boolean>`                       | Any field modified           |
| `submitting`  | `Ref<boolean>`                       | Form is submitting           |
| `isValid`     | `Ref<boolean>`                       | No validation errors         |
| `validating`  | `Ref<boolean>`                       | Validation in progress       |
| `submitted`   | `Ref<boolean>`                       | Form submitted at least once |
| `submitCount` | `Ref<number>`                        | Total submissions            |

| Method            | Signature                                           |
| ----------------- | --------------------------------------------------- |
| `setFieldValue`   | `(path: string, value: any) => void`                |
| `setValues`       | `(values: Partial<T>) => void`                      |
| `setFieldTouched` | `(path: string, touched: boolean) => void`          |
| `getFieldValue`   | `(path: string) => any`                             |
| `getFieldError`   | `(path: string) => string \| undefined`             |
| `registerField`   | `(path: string, schema?: FieldSchema) => Field`     |
| `submit`          | `(onSubmit?: () => Promise<void>) => Promise<void>` |
| `reset`           | `() => void`                                        |
| `validate`        | `() => Promise<FormValidationResult>`               |
| `clearErrors`     | `() => void`                                        |
| `getErrors`       | `() => Record<string, string>`                      |

### `useField(path, form, options?)`

Composable for binding a single field to Vue refs.

```ts
import { useField } from '@d-form/vue'

const { value, error, touched, setValue, setTouched, validate } = useField('email', form)
```

**Returns:** `UseFieldReturn<T>`

| Property     | Type                       |
| ------------ | -------------------------- |
| `value`      | `Ref<T>`                   |
| `error`      | `Ref<string \| undefined>` |
| `touched`    | `Ref<boolean>`             |
| `dirty`      | `Ref<boolean>`             |
| `visible`    | `Ref<boolean>`             |
| `disabled`   | `Ref<boolean>`             |
| `validating` | `Ref<boolean>`             |
| `field`      | `Field \| undefined`       |

| Method       | Signature                                             |
| ------------ | ----------------------------------------------------- |
| `setValue`   | `(value: T) => void`                                  |
| `setTouched` | `(touched: boolean) => void`                          |
| `validate`   | `() => ValidationResult \| Promise<ValidationResult>` |

Automatically unsubscribes from field events on component unmount.

### Components

#### `<DForm>`

Root form component. Creates form context and provides it to children.

**Props:**

| Prop            | Type                                     | Description            |
| --------------- | ---------------------------------------- | ---------------------- |
| `schema`        | `FormSchema`                             | Form schema definition |
| `initialValues` | `Record<string, any>`                    | Starting values        |
| `onSubmit`      | `(values: any) => Promise<void> \| void` | Submit handler         |

**Exposes:** All `useForm` return properties and methods, plus `getComponent`, `hasComponent`, `registerComponent` from the form context.

#### `<DField>`

Renders a single form field using the component registry.

**Props:**

| Prop        | Type                  | Description         |
| ----------- | --------------------- | ------------------- |
| `name`      | `string`              | Field path          |
| `schema`    | `FieldSchema`         | Field schema config |
| `component` | `string \| Component` | Override component  |
| `disabled`  | `boolean`             | Disable the field   |

**Exposes:** `validate()`, `value`, `error`, `touched`

#### `<DFormItem>`

Wraps a form field with label, required markerisk, error message, and description.

**Props:**

| Prop        | Type                  | Description                                                  |
| ----------- | --------------------- | ------------------------------------------------------------ |
| `name`      | `string`              | Field path (required)                                        |
| `schema`    | `FieldSchema`         | Field schema. Falls back to injected context if not provided |
| `label`     | `string`              | Override `schema.title` for the label text                   |
| `required`  | `boolean`             | Override `schema.required` for required asterisk             |
| `component` | `string \| Component` | Override the rendering component                             |
| `disabled`  | `boolean`             | Disable the field                                            |

**Slots:**

| Slot      | Description                                  |
| --------- | -------------------------------------------- |
| `default` | Custom field content. Defaults to `<DField>` |

**Exposes:**

| Name       | Type           | Description           |
| ---------- | -------------- | --------------------- |
| `validate` | `Function`     | Validate the field    |
| `error`    | `Ref<string>`  | Current error message |
| `touched`  | `Ref<boolean>` | Current touched state |

**CSS Classes:**

| Class                       | Description                                      |
| --------------------------- | ------------------------------------------------ |
| `.d-form-item`              | Container div                                    |
| `.d-form-item--label-left`  | Horizontal layout (label + control side by side) |
| `.d-form-item--label-top`   | Vertical layout (label above control)            |
| `.d-form-item__label`       | Label element                                    |
| `.d-form-item__required`    | Required asterisk (`*`) in red                   |
| `.d-form-item__control`     | Control wrapper div                              |
| `.d-form-item__error`       | Error message (red, shown when touched + error)  |
| `.d-form-item__description` | Description/help text (gray)                     |

#### `<DFormItems>`

Auto-renders component that iterates `schema.properties` and renders a `<DFormItem>` for each non-void field.

**Props:** None (reads schema from injected context).

**Slots:** None (renders `<DFormItem>` for each property).

**Exposes:** None.

### Renderer

#### `registerComponent(name, component)`

Register a Vue component globally for a given name string.

```ts
import { registerComponent } from '@d-form/vue'
import MyCustomInput from './MyCustomInput.vue'

registerComponent('my-input', MyCustomInput)
```

#### `getComponent(name)`

Look up a registered component by name.

#### `hasComponent(name)`

Check if a component name is registered.

#### `createRenderer()`

Returns an `IRenderer` instance with `registerComponent`, `getComponent`, `hasComponent`, and `renderField`.

#### `createFormContext()`

Creates a scoped component registry with a local-then-global lookup chain. Used internally by `<DForm>`.

---

## @d-form/element-plus

Element Plus adapters. Re-exports everything from `@d-form/vue`.

### `registerElementPlusComponents()`

One-call setup that registers all Element Plus adapters. Call this once during app initialization.

```ts
import { registerElementPlusComponents } from '@d-form/element-plus'

registerElementPlusComponents()
```

This registers the following component names:

| Name             | Element Plus Component  | Description                |
| ---------------- | ----------------------- | -------------------------- |
| `'input'`        | `ElInput`               | Text input                 |
| `'select'`       | `ElSelect` + `ElOption` | Dropdown select            |
| `'date-picker'`  | `ElDatePicker`          | Date selection             |
| `'checkbox'`     | `ElCheckbox`            | Checkbox                   |
| `'radio'`        | `ElRadio`               | Radio button               |
| `'switch'`       | `ElSwitch`              | Toggle switch              |
| `'input-number'` | `ElInputNumber`         | Number input with controls |
| `'textarea'`     | `ElInput` (textarea)    | Multi-line text            |

### Adapter Components

Each adapter is also exported individually if you need custom registration:

```ts
import {
  InputAdapter,
  SelectAdapter,
  DatePickerAdapter,
  CheckboxAdapter,
  RadioAdapter,
  SwitchAdapter,
  InputNumberAdapter,
  TextareaAdapter,
} from '@d-form/element-plus'
```

All adapters share a common props interface:

| Prop         | Type          | Description                                      |
| ------------ | ------------- | ------------------------------------------------ |
| `name`       | `string`      | Field name                                       |
| `modelValue` | varies        | Current value                                    |
| `schema`     | `FieldSchema` | Field schema (drives placeholder, options, etc.) |
| `error`      | `string`      | Validation error                                 |
| `touched`    | `boolean`     | Field touched state                              |
| `disabled`   | `boolean`     | Disabled state                                   |

| Emit                | Payload | Description   |
| ------------------- | ------- | ------------- |
| `update:modelValue` | `value` | Value changed |
| `blur`              | `void`  | Field blurred |
