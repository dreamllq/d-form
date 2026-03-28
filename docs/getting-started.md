# Getting Started

This guide walks you through setting up d-form in a Vue 3 project with Element Plus.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Vue 3.4+
- Element Plus 2.8+ (if using `@d-form/element-plus`)

## Installation

d-form is a monorepo with four packages. For most Vue + Element Plus projects, you only need the top-level adapter package:

```bash
pnpm add @d-form/element-plus
```

This pulls in `@d-form/vue`, `@d-form/core`, and `@d-form/shared` as dependencies.

If you're not using Element Plus, install `@d-form/vue` instead and provide your own component adapters:

```bash
pnpm add @d-form/vue
```

## Setup

Register Element Plus adapters once during app initialization:

```ts
// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { registerElementPlusComponents } from '@d-form/element-plus'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)

// Register all d-form component adapters
registerElementPlusComponents()

app.mount('#app')
```

This maps component names like `'input'`, `'select'`, `'date-picker'` to their Element Plus implementations.

## Basic Usage

### Define a Schema

Describe your form as a plain JavaScript object:

```ts
const schema = {
  type: 'object' as const,
  properties: {
    name: {
      type: 'string',
      title: 'Name',
      component: 'input',
      placeholder: 'Your full name',
    },
    email: {
      type: 'string',
      title: 'Email',
      component: 'input',
      placeholder: 'you@example.com',
    },
    role: {
      type: 'string',
      title: 'Role',
      component: 'select',
      enum: [
        { label: 'Developer', value: 'dev' },
        { label: 'Designer', value: 'design' },
        { label: 'Manager', value: 'pm' },
      ],
    },
  },
}
```

### Option A: Composable API

Use `useForm` for full control in `<script setup>`:

```vue
<script setup lang="ts">
import { useForm } from '@d-form/vue'

const schema = {
  type: 'object' as const,
  properties: {
    name: { type: 'string', title: 'Name', component: 'input' },
    email: { type: 'string', title: 'Email', component: 'input' },
  },
}

const { values, errors, setFieldValue, submit, reset, isValid } = useForm({
  schema,
  initialValues: { name: 'Jane' },
  onSubmit: async (values) => {
    console.log('Submitted:', values)
  },
})
</script>

<template>
  <div>
    <div>
      <label>Name</label>
      <input
        :value="values.name"
        @input="(e) => setFieldValue('name', (e.target as HTMLInputElement).value)"
      />
      <span v-if="errors.name">{{ errors.name }}</span>
    </div>

    <div>
      <label>Email</label>
      <input
        :value="values.email"
        @input="(e) => setFieldValue('email', (e.target as HTMLInputElement).value)"
      />
      <span v-if="errors.email">{{ errors.email }}</span>
    </div>

    <button @click="submit">Submit</button>
    <button @click="reset">Reset</button>
  </div>
</template>
```

### Option B: Component API

Use `<DForm>` with `<DFormItem>` for automatic label, error, and description rendering:

```vue
<script setup lang="ts">
import { DForm, DFormItem, DFormItems } from '@d-form/vue'

const schema = {
  type: 'object' as const,
  properties: {
    name: { type: 'string', title: 'Name', component: 'input' },
    email: { type: 'string', title: 'Email', component: 'input' },
    role: {
      type: 'string',
      title: 'Role',
      component: 'select',
      enum: [
        { label: 'Developer', value: 'dev' },
        { label: 'Designer', value: 'design' },
      ],
    },
  },
}

const handleSubmit = async (values: any) => {
  console.log('Submitted:', values)
}
</script>

<template>
  <!-- Manual layout with DFormItem for each field -->
  <DForm :schema="schema" :on-submit="handleSubmit">
    <DFormItem name="name" :schema="schema.properties.name" />
    <DFormItem name="email" :schema="schema.properties.email" />
    <DFormItem name="role" :schema="schema.properties.role" />
    <button type="submit">Submit</button>
  </DForm>

  <!-- Auto-rendering with DFormItems -->
  <DForm :schema="schema" :on-submit="handleSubmit">
    <DFormItems />
    <button type="submit">Submit</button>
  </DForm>
</template>
```

**DFormItem** reads `schema.title` for the label, shows a required asterisk when `schema.required` is true, displays error messages when the field is touched and has an error, and renders `schema.description` as help text.

**DFormItems** automatically iterates all properties in the schema and renders a `<DFormItem>` for each one (skipping `type: 'void'` fields).

## Adding Validation

Add validation rules to field schemas:

```ts
const schema = {
  type: 'object' as const,
  properties: {
    username: {
      type: 'string',
      title: 'Username',
      component: 'input',
      validation: {
        rules: [
          { type: 'required', message: 'Username is required' },
          { type: 'minLength', value: 3, message: 'At least 3 characters' },
        ],
        trigger: 'blur',
      },
    },
    age: {
      type: 'number',
      title: 'Age',
      component: 'input-number',
      validation: {
        rules: [
          { type: 'required', message: 'Age is required' },
          { type: 'min', value: 18, message: 'Must be at least 18' },
        ],
      },
    },
  },
}

// Enable blur/change validation in useForm
const form = useForm({
  schema,
  validateOnBlur: true,
  validateOnChange: true,
})
```

Validation runs automatically when fields blur or change (based on `trigger`), and always runs on submit. The form won't call `onSubmit` if validation fails.

### Using Zod for Validation

Pass a Zod schema instead of per-field rules:

```ts
import { z } from 'zod'
import { useForm } from '@d-form/vue'

const zodSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'At least 8 characters'),
  age: z.number().min(18, 'Must be 18 or older'),
})

const form = useForm({
  schema: {
    type: 'object' as const,
    properties: {
      email: { type: 'string', title: 'Email', component: 'input' },
      password: { type: 'string', title: 'Password', component: 'input' },
      age: { type: 'number', title: 'Age', component: 'input-number' },
    },
  },
  zodSchema,
})
```

When a `zodSchema` is provided, the form validates through Zod and maps errors back to field paths.

## Field Linkage (Reactions)

Reactions let fields respond to changes in other fields. Define them in a field's `reactions` array:

```ts
const schema = {
  type: 'object' as const,
  properties: {
    hasCompany: {
      type: 'boolean',
      title: 'Do you have a company?',
      component: 'switch',
      reactions: [
        {
          dependencies: ['hasCompany'],
          target: 'companyName',
          when: '{{$deps[0] === true}}',
          fulfill: { state: { visible: true } },
          otherwise: { state: { visible: false } },
        },
      ],
    },
    companyName: {
      type: 'string',
      title: 'Company Name',
      component: 'input',
      visible: false,
      validation: {
        rules: [{ type: 'required', message: 'Company name is required' }],
        validateVisibleOnly: true,
      },
    },
  },
}
```

When `hasCompany` toggles, the reaction evaluates the `when` condition and applies either `fulfill` or `otherwise` to the `companyName` field's state.

The `validateVisibleOnly: true` flag means the required rule on `companyName` won't block form submission when the field is hidden.

## Using Individual Fields with `useField`

For fine-grained control over a single field:

```vue
<script setup lang="ts">
import { useForm, useField } from '@d-form/vue'

const form = useForm({
  schema: {
    type: 'object' as const,
    properties: {
      email: { type: 'string', title: 'Email', component: 'input' },
    },
  },
})

const { value, error, touched, setValue, setTouched, validate } = useField('email', form.form)
</script>

<template>
  <div>
    <input
      :value="value"
      @input="(e) => setValue((e.target as HTMLInputElement).value)"
      @blur="() => setTouched(true)"
    />
    <p v-if="touched && error" class="error">{{ error }}</p>
  </div>
</template>
```

## Custom Adapters

Write your own adapter to use a different component library or custom inputs:

```vue
<!-- CustomInputAdapter.vue -->
<template>
  <input
    :value="modelValue"
    :disabled="disabled"
    :placeholder="schema?.placeholder"
    :class="{ 'has-error': error }"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    @blur="$emit('blur')"
  />
</template>

<script setup lang="ts">
import type { FieldSchema } from '@d-form/shared'

defineProps<{
  name: string
  modelValue: string
  schema?: FieldSchema
  error?: string
  touched?: boolean
  disabled?: boolean
}>()

defineEmits<{
  'update:modelModelValue': [value: string]
  blur: []
}>()
</script>
```

Register it:

```ts
import { registerComponent } from '@d-form/vue'
import CustomInputAdapter from './CustomInputAdapter.vue'

registerComponent('my-input', CustomInputAdapter)
```

Then use it in a schema:

```ts
{
  type: 'string',
  title: 'Custom Field',
  component: 'my-input'
}
```

## Working with the Core Directly

If you're building a non-Vue integration, you can use `@d-form/core` directly:

```ts
import { createForm } from '@d-form/core'

const form = createForm({
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
    },
  },
  initialValues: { name: 'Jane' },
  onSubmit: async (values) => {
    console.log('Form submitted:', values)
  },
  onValuesChange: (values, changedPath) => {
    console.log(`${changedPath} changed to:`, values[changedPath])
  },
})

// Read values
form.getFieldValue('name') // 'Jane'

// Set values
form.setFieldValue('email', 'jane@example.com')

// Validate
const result = await form.validate()
if (result.valid) {
  await form.submit()
}

// Reset
form.reset()
```

The core `Form` and `Field` classes have no framework dependencies. They manage state, validation, and reactions on their own.

## What's Next

- Read the [Architecture](./architecture.md) doc for how packages relate to each other
- Check the [Schema Spec](./schema-spec.md) for every schema property and reaction option
- Browse the [API Reference](./api.md) for method signatures and return types
