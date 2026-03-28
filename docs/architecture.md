# Architecture

d-form is a schema-driven dynamic form library built as a monorepo. It separates form logic from UI rendering through a layered package design, letting you describe forms declaratively and swap rendering layers without touching business logic.

## Package Overview

The project lives in `packages/` with four packages that form a dependency chain:

```
@d-form/shared  (types, utilities, i18n)
       |
@d-form/core    (form engine, validation, reactive system, expressions)
       |
@d-form/vue     (Vue 3 composables, components, renderer)
       |
@d-form/element-plus  (Element Plus component adapters)
```

### @d-form/shared

The foundation package. Zero dependencies. It holds all TypeScript type definitions used across the ecosystem, a handful of general-purpose utility functions, and an internationalization module.

**Types** include form schemas, field schemas, validation rules, reaction (linkage) configs, and the core interfaces like `FormInstance` and `FieldInstance`. Every other package imports types from here.

**Utilities** are small, focused functions:

| Function                                   | Purpose                                                      |
| ------------------------------------------ | ------------------------------------------------------------ |
| `get(obj, path)`                           | Deep property access by dot path (`'a.b.c'`)                 |
| `set(obj, path, value)`                    | Deep property mutation by dot path                           |
| `has(obj, path)`                           | Check if a deep path exists                                  |
| `deepClone(obj)`                           | Recursive clone handling Date, RegExp, arrays, plain objects |
| `deepMerge(target, ...sources)`            | Recursive merge of plain objects                             |
| `isPlainObject`, `isArray`, `isDate`, etc. | Type guards                                                  |

**i18n** provides a lightweight `createI18n()` function that supports locale switching, message interpolation with `{param}` syntax, and bundled translations for English (`en`) and Simplified Chinese (`zh-CN`). Validation messages ship out of the box.

### @d-form/core

The form engine. Depends on `@d-form/shared`. Framework-agnostic. This is where the real work happens: form state management, field lifecycle, validation (built-in rules plus optional Zod support), a reactive observation system, an expression compiler, and field linkage (reactions).

Key classes:

- **`Form`** tracks values, errors, touched state, dirty flags, and submission status. Fields are registered by path and stored in a `Map<string, Field>`. The `createForm()` factory function creates an instance with schema-based field auto-registration.
- **`Field`** wraps a single form field with its value, validation state, dirty/touched flags, and an event emitter for `valueChange`, `touchedChange`, and `stateChange`.
- **`Reaction`** implements field linkage. A reaction watches dependency fields for value changes, evaluates a condition expression, then applies state or schema effects to target fields. Circular dependency detection prevents infinite loops.

The reactive system is a custom Proxy-based observable/autorun implementation (`observable()`, `autorun()`). It uses a `Tracker` class per property to collect subscribers and notify them on change. This powers internal reactivity without coupling to Vue or any framework.

The expression compiler parses `{{expression}}` strings, compiles them into sandboxed functions using the `Function` constructor with a `with` statement for scope access, and caches the results. It handles scope variables like `$self`, `$deps`, `$values`, and `$form`.

Validation supports two modes:

1. **Built-in rules**: `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `custom`. Rules can be sync or async.
2. **Zod schemas**: Pass a Zod schema to `createForm()` and the form validates via Zod's `parseAsync()`, mapping Zod errors back to field paths.

### @d-form/vue

The Vue 3 integration layer. Depends on `@d-form/core` and `@d-form/shared`. It provides composables, Vue components, and a component registry renderer.

**Composables:**

- `useForm(schemaOrOptions)` wraps `createForm()` and syncs form state into Vue reactivity (`ref`, `reactive`). Returns reactive `values`, `errors`, `touched`, plus methods like `setFieldValue`, `submit`, `reset`, `validate`.
- `useField(path, form, options)` binds a single field to Vue refs. Subscribes to field events (`valueChange`, `stateChange`) and cleans up on unmount.

**Components:**

- `<DForm>` creates a form context via `useForm`, provides it through Vue's `provide/inject`, and renders a `<form>` element with a default slot.
- `<DField>` connects to the injected form context, resolves the rendering component from the registry, and renders it with `v-model` binding.

**Renderer:**

A global component registry (`Map<string, Component>`) maps string names to Vue components. `createRenderer()` returns an `IRenderer` that resolves a `FieldSchema.component` string to a registered component and renders it via `h()`. `createFormContext()` adds a local registry layer for per-form component overrides.

### @d-form/element-plus

The Element Plus adapter package. Depends on all three packages above plus `element-plus` and `vue`. It ships pre-built adapter components that wrap Element Plus inputs, selects, date pickers, checkboxes, radios, switches, input numbers, and textareas.

Each adapter follows a consistent contract:

- Accepts `modelValue`, `name`, `error`, `touched`, `disabled`, `schema` props
- Emits `update:modelValue` and `blur` events
- Derives UI configuration (placeholder, options, clearable) from the field schema

The `registerElementPlusComponents()` function registers all adapters with the global component registry in a single call. Call it once during app setup.

## Design Decisions

### Schema-driven, not component-driven

Forms are described as data (a `FormSchema` object), not as JSX/template trees. This makes schemas serializable, storable, and transmittable over the network. A backend can generate a schema and the frontend renders it without code changes.

### Framework-agnostic core

`@d-form/core` has zero knowledge of Vue, React, or any rendering library. The `Form` and `Field` classes are plain TypeScript with no framework imports. This means a future `@d-form/react` package could reuse the exact same engine.

### Reactive system independence

The custom `observable`/`autorun` system in core avoids tying the form engine to Vue's reactivity. It's a lightweight alternative that handles the core's internal needs. The Vue layer then maps this into `ref`/`reactive` via `useForm` and `useField`.

### Expression-based linkage

Field reactions use `{{expression}}` syntax compiled at runtime. This gives schema authors a flexible way to express conditional visibility, computed defaults, and cross-field dependencies without writing callback functions. The tradeoff is that expressions run through `new Function()`, which some CSP policies block.

### Validation flexibility

Built-in rules cover the common cases. Zod integration handles the complex ones. You can mix both in the same form by using built-in rules per field and a Zod schema for whole-form validation. The form detects which mode to use based on whether a `zodSchema` was provided.

### Adapter pattern for UI libraries

The component registry and adapter pattern decouple form logic from specific UI components. Swap Element Plus for a different library by writing new adapters and registering them. The schema and form logic don't change.

## Build and Development

The monorepo uses pnpm workspaces and Turborepo for orchestration.

```
pnpm install          # Install all dependencies
pnpm build            # Build all packages (via Turborepo)
pnpm test             # Run tests across all packages
pnpm type-check       # TypeScript checking across all packages
pnpm lint             # ESLint across all packages
```

Each package builds with Vite (library mode) and emits TypeScript declarations via `tsc --build`. Output goes to `dist/` with both ESM and CJS entry points.

## Dependency Graph

```
d-form (root workspace)
  |
  +-- @d-form/shared       (no deps)
  |
  +-- @d-form/core         -> @d-form/shared
  |                         peerDep: zod ^3.0.0 || ^4.0.0
  |
  +-- @d-form/vue          -> @d-form/core, @d-form/shared
  |                         peerDep: vue ^3.4.0
  |
  +-- @d-form/element-plus -> @d-form/vue, @d-form/core, @d-form/shared
                              peerDep: element-plus ^2.8.0, vue ^3.4.0
```
