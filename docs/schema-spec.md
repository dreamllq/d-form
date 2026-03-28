# Schema Specification

d-form uses a JSON-based schema to describe forms declaratively. A schema defines what fields exist, how they validate, how they link to each other, and how they render. This document is a complete reference for the schema format.

## Top-Level Structure

A form schema is an object with `type: 'object'` and a `properties` map:

```ts
const schema = {
  type: 'object',
  properties: {
    fieldName: {
      /* FieldSchema */
    },
    // ...
  },
  uiSchema: {
    /* UISchema */
  },
  reactions: [
    /* ReactionSchema[] */
  ],
  title: 'Form Title',
  description: 'A description of this form',
  default: {
    /* initial values */
  },
}
```

### `type`

Always `'object'` for form schemas. This distinguishes the form root from individual field schemas.

### `properties`

A map of field name to `FieldSchema`. Each key becomes a field path. For nested objects, use dot-separated paths in field operations.

```ts
properties: {
  name: { type: 'string', title: 'Full Name' },
  age: { type: 'number', title: 'Age' },
  address: {
    type: 'object',
    properties: {
      street: { type: 'string', title: 'Street' },
      city: { type: 'string', title: 'City' }
    }
  }
}
```

### `uiSchema`

Controls form-wide display settings.

```ts
uiSchema: {
  layout: 'horizontal',        // 'horizontal' | 'vertical' | 'inline'
  labelWidth: '120px',         // string | number
  gutter: 16,                  // spacing in px
  columns: 2,                  // grid columns
  size: 'default',             // 'small' | 'default' | 'large'
  labelPosition: 'right',      // 'left' | 'right' | 'top'
  colon: true,                 // append colon to labels
  showRequiredAsterisk: true   // show * for required fields
}
```

### `reactions`

Form-level reactions. See the [Reactions](#reactions) section below.

### `title`, `description`

Metadata for display or documentation.

### `default`

An object of default values. Merged with `initialValues` passed to the form constructor, with `initialValues` taking precedence.

## Field Schema

Each field in `properties` is a `FieldSchema` object:

```ts
interface FieldSchema {
  type: FieldType | string
  key?: string
  title?: string
  description?: string
  default?: any
  component?: string
  componentProps?: Record<string, any>
  validation?: ValidationConfig
  reactions?: ReactionConfig[]
  visible?: boolean
  disabled?: boolean
  placeholder?: string
  /** Label position override for this field */
  labelPosition?: 'left' | 'right' | 'top'
  /** Label width override for this field (e.g. '100px', 100) */
  labelWidth?: string | number
  required?: boolean
  enum?: Array<{ label: string; value: any }> | any[]
  properties?: Record<string, FieldSchema>
  items?: FieldSchema
}
```

### `type`

The field's data type. Built-in types:

| Type        | Value Type            | Description                        |
| ----------- | --------------------- | ---------------------------------- |
| `'string'`  | `string`              | Text fields                        |
| `'number'`  | `number`              | Numeric fields                     |
| `'boolean'` | `boolean`             | Checkboxes, toggles                |
| `'object'`  | `Record<string, any>` | Nested field groups                |
| `'array'`   | `any[]`               | Repeatable field groups            |
| `'date'`    | `Date`                | Date pickers                       |
| `'void'`    | `undefined`           | Non-data fields (labels, dividers) |

You can also pass custom type strings for domain-specific handling.

### `title`

Display label. Renderers use this as the field label text.

### `description`

Help text shown below or beside the field.

### `default`

Default value when the form initializes and no explicit initial value is provided.

```ts
{
  type: 'string',
  title: 'Country',
  default: 'US'
}
```

### `component`

String name of the component to render. Must match a name registered in the component registry.

```ts
{
  type: 'string',
  component: 'input'          // Renders the registered 'input' adapter
}

{
  type: 'string',
  component: 'select'         // Renders the registered 'select' adapter
}
```

Standard component names from `@d-form/element-plus`: `'input'`, `'select'`, `'date-picker'`, `'checkbox'`, `'radio'`, `'switch'`, `'input-number'`, `'textarea'`.

### `componentProps`

Extra props forwarded to the rendered component.

```ts
{
  type: 'string',
  component: 'input',
  componentProps: {
    maxlength: 100,
    showWordLimit: true,
    clearable: true
  }
}
```

### `placeholder`

Shortcut for the placeholder text. Some adapters read this from the schema directly.

```ts
{
  type: 'string',
  component: 'input',
  placeholder: 'Enter your email'
}
```

### `labelPosition`

Per-field label alignment override.

- **Type**: `'left' | 'right' | 'top'`
- **Default**: inherits from form level (defaults to `'right'`)

**Priority chain**: DFormItem prop > FieldSchema > DForm prop > uiSchema > `'right'`

Example:

```ts
{
  type: 'string',
  title: 'Email',
  labelPosition: 'top'
}
```

### `labelWidth`

Per-field label width override.

- **Type**: `string | number`
- **Default**: inherits from form level

When a number is provided, it is automatically converted to pixels (e.g. `100` becomes `'100px'`).

**Priority chain**: DFormItem prop > FieldSchema > DForm prop > uiSchema

Example:

```ts
{
  type: 'string',
  title: 'Email',
  labelWidth: '200px'
}
```

### `visible`

Initial visibility. Defaults to `true`. Set to `false` to hide a field.

```ts
{
  type: 'string',
  title: 'Secret Field',
  visible: false
}
```

### `disabled`

Initial disabled state. Defaults to `false`.

```ts
{
  type: 'string',
  title: 'Read-only Name',
  disabled: true,
  default: 'Cannot change this'
}
```

### `required`

A display-only marker. Adds a visual indicator (usually an asterisk) to the field label. Actual validation enforcement comes from validation rules.

```ts
{
  type: 'string',
  title: 'Email',
  required: true,
  validation: {
    rules: [{ type: 'required', message: 'Email is required' }]
  }
}
```

### `enum`

Options for select, radio, and checkbox fields.

```ts
{
  type: 'string',
  component: 'select',
  enum: [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' }
  ]
}
```

### `properties`

Nested fields for object-type fields.

```ts
{
  type: 'object',
  title: 'Address',
  properties: {
    street: { type: 'string', title: 'Street', component: 'input' },
    city: { type: 'string', title: 'City', component: 'input' },
    zip: { type: 'string', title: 'ZIP', component: 'input' }
  }
}
```

### `items`

Schema for array items. Each element in the array uses this schema.

```ts
{
  type: 'array',
  title: 'Tags',
  items: {
    type: 'string',
    component: 'input'
  }
}
```

## Validation

### ValidationConfig

```ts
interface ValidationConfig {
  rules?: ValidationRule[]
  validator?: string
  trigger?: 'blur' | 'change' | 'submit' | ('blur' | 'change' | 'submit')[]
  validateVisibleOnly?: boolean
}
```

### ValidationRule

```ts
interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: any
  message?: string
  validator?: (value: any) => boolean | Promise<boolean>
}
```

### Built-in Rule Types

#### `required`

Checks that the value is not `undefined`, `null`, `''`, or an empty array.

```ts
{ type: 'required', message: 'This field is required' }
```

#### `min`

Checks that a number is at least `value`.

```ts
{ type: 'min', value: 0, message: 'Must be non-negative' }
```

#### `max`

Checks that a number is at most `value`.

```ts
{ type: 'max', value: 100, message: 'Cannot exceed 100' }
```

#### `minLength`

Checks that a string has at least `value` characters.

```ts
{ type: 'minLength', value: 8, message: 'At least 8 characters' }
```

#### `maxLength`

Checks that a string has at most `value` characters.

```ts
{ type: 'maxLength', value: 140, message: 'Maximum 140 characters' }
```

#### `pattern`

Checks that a string matches a regular expression.

```ts
{ type: 'pattern', value: /^[a-z]+$/, message: 'Lowercase letters only' }
```

#### `custom`

Runs a custom validator function. Can be async.

```ts
{
  type: 'custom',
  message: 'Username already taken',
  validator: async (value) => {
    const response = await fetch(`/api/check-username?name=${value}`)
    return response.ok
  }
}
```

### Trigger Modes

Control when validation runs:

```ts
validation: {
  trigger: 'blur' // validate when field loses focus
  trigger: 'change' // validate on every value change
  trigger: 'submit' // validate only on form submit
  trigger: ['blur', 'change'] // validate on both blur and change
}
```

The trigger setting works with the form-level `validateOnBlur` and `validateOnChange` options. Both must be enabled for trigger-based validation to fire.

### validateVisibleOnly

When `true`, this field is skipped during form validation if it's not visible. Useful for conditionally shown fields that shouldn't block form submission.

```ts
validation: {
  rules: [{ type: 'required' }],
  validateVisibleOnly: true
}
```

### Example: Multi-rule Field

```ts
{
  type: 'string',
  title: 'Password',
  component: 'input',
  validation: {
    rules: [
      { type: 'required', message: 'Password is required' },
      { type: 'minLength', value: 8, message: 'At least 8 characters' },
      {
        type: 'pattern',
        value: /^(?=.*[A-Z])(?=.*\d)/,
        message: 'Must contain an uppercase letter and a number'
      }
    ],
    trigger: 'blur'
  }
}
```

## Reactions

Reactions create dynamic behavior between fields. A reaction watches dependency fields, evaluates a condition, and applies effects to target fields.

### ReactionConfig

```ts
interface ReactionConfig {
  dependencies?: string[]
  target?: string | string[]
  when?: string
  fulfill?: ReactionEffect
  otherwise?: ReactionEffect
}
```

### `dependencies`

Array of field paths this reaction watches. When any dependency's value changes, the reaction runs.

```ts
dependencies: ['country', 'region']
```

### `target`

Which field(s) to modify. If omitted, the reaction modifies the field it's defined on.

```ts
target: 'province' // single target
target: ['city', 'district'] // multiple targets
```

### `when`

A condition expression using the `{{expression}}` syntax. Available scope variables:

| Variable        | Description                          |
| --------------- | ------------------------------------ |
| `$self`         | The source field's state object      |
| `$deps`         | Array of dependency values, in order |
| `$values`       | All form values as an object         |
| `$form`         | The Form instance                    |
| `$dependencies` | Named dependency map (path to value) |

```ts
when: '{{$deps[0] === "CN"}}'
```

### `fulfill` and `otherwise`

Effects applied when the condition is true (`fulfill`) or false (`otherwise`).

```ts
interface ReactionEffect {
  state?: Partial<FieldState>
  schema?: Partial<FieldSchema>
  run?: string
}
```

**State changes** modify the field's runtime state:

```ts
fulfill: {
  state: { visible: true, disabled: false }
}
```

**Schema changes** modify the field's schema (affects rendering):

```ts
fulfill: {
  schema: {
    placeholder: 'Select a province'
  }
}
```

**Run** executes an expression for side effects:

```ts
fulfill: {
  run: '{{$form.setFieldValue("city", "")}}'
}
```

### Example: Conditional Visibility

Show a "Province" field only when country is "CN":

```ts
{
  type: 'object',
  properties: {
    country: {
      type: 'string',
      title: 'Country',
      component: 'select',
      enum: [
        { label: 'China', value: 'CN' },
        { label: 'Other', value: 'OTHER' }
      ],
      reactions: [{
        dependencies: ['country'],
        target: 'province',
        when: '{{$deps[0] === "CN"}}',
        fulfill: { state: { visible: true } },
        otherwise: { state: { visible: false } }
      }]
    },
    province: {
      type: 'string',
      title: 'Province',
      component: 'select',
      visible: false,
      enum: [
        { label: 'Beijing', value: 'BJ' },
        { label: 'Shanghai', value: 'SH' }
      ]
    }
  }
}
```

### Example: Computed Value

Auto-fill a display name from first and last name:

```ts
{
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      title: 'First Name',
      component: 'input',
      reactions: [{
        dependencies: ['firstName', 'lastName'],
        target: 'displayName',
        when: '{{true}}',
        fulfill: {
          state: {
            value: '{{$deps[0] + " " + $deps[1]}}'
          }
        }
      }]
    },
    lastName: {
      type: 'string',
      title: 'Last Name',
      component: 'input'
    },
    displayName: {
      type: 'string',
      title: 'Display Name',
      component: 'input',
      disabled: true
    }
  }
}
```

### Example: Disable on Condition

Disable the "endDate" field until "startDate" has a value:

```ts
startDate: {
  type: 'date',
  title: 'Start Date',
  component: 'date-picker',
  reactions: [{
    dependencies: ['startDate'],
    target: 'endDate',
    when: '{{$deps[0] !== undefined && $deps[0] !== null && $deps[0] !== ""}}',
    fulfill: { state: { disabled: false } },
    otherwise: { state: { disabled: true } }
  }]
}
```

### Circular Dependency Protection

The reaction system throws an error at creation time if a field is both a dependency and a target of the same reaction. This prevents infinite update loops.

## Full Schema Example

```ts
const userFormSchema = {
  type: 'object' as const,
  title: 'User Registration',
  description: 'Create a new account',

  uiSchema: {
    layout: 'vertical',
    labelPosition: 'top',
    size: 'default',
  },

  properties: {
    username: {
      type: 'string',
      title: 'Username',
      component: 'input',
      placeholder: 'Choose a username',
      required: true,
      validation: {
        rules: [
          { type: 'required', message: 'Username is required' },
          { type: 'minLength', value: 3, message: 'At least 3 characters' },
          { type: 'maxLength', value: 20, message: 'At most 20 characters' },
        ],
        trigger: 'blur',
      },
    },

    email: {
      type: 'string',
      title: 'Email',
      component: 'input',
      placeholder: 'you@example.com',
      required: true,
      validation: {
        rules: [
          { type: 'required', message: 'Email is required' },
          { type: 'pattern', value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
        ],
        trigger: 'blur',
      },
    },

    password: {
      type: 'string',
      title: 'Password',
      component: 'input',
      required: true,
      validation: {
        rules: [
          { type: 'required', message: 'Password is required' },
          { type: 'minLength', value: 8, message: 'At least 8 characters' },
        ],
        trigger: 'blur',
      },
    },

    role: {
      type: 'string',
      title: 'Role',
      component: 'select',
      enum: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
      ],
      default: 'viewer',
      reactions: [
        {
          dependencies: ['role'],
          target: 'department',
          when: '{{$deps[0] === "admin"}}',
          fulfill: { state: { visible: false } },
          otherwise: { state: { visible: true } },
        },
      ],
    },

    department: {
      type: 'string',
      title: 'Department',
      component: 'select',
      enum: [
        { label: 'Engineering', value: 'eng' },
        { label: 'Marketing', value: 'mkt' },
        { label: 'Sales', value: 'sales' },
      ],
    },
  },
}
```
