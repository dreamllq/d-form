# @d-form/vue

Vue 3 integration layer. Depends on `@d-form/core` + `@d-form/shared`. ~570 lines of source.

## STRUCTURE

```
src/
├── composables/   # useForm (209), useField (115) — Vue↔core bridge
├── components/    # DForm.vue (62), DField.vue (59), DFormItem.vue (104), DFormItems.vue (30) — provide/inject + rendering
├── renderer/      # index.ts (70), types.ts (50) — component registry + renderField()
└── index.ts       # Barrel: re-exports core + all modules
```

## WHERE TO LOOK

| Task                       | File                        | Notes                                                   |
| -------------------------- | --------------------------- | ------------------------------------------------------- |
| Add composable             | `composables/`              | Follow useForm/useField patterns                        |
| Add form feature           | `composables/useForm.ts`    | Wraps core Form, syncs Vue refs                         |
| Add field binding          | `composables/useField.ts`   | Subscribes to Field events, updates refs                |
| Modify form component      | `components/DForm.vue`      | provide/inject provider, wraps useForm                  |
| Modify field component     | `components/DField.vue`     | Dynamic component resolution via registry               |
| Modify form item component | `components/DFormItem.vue`  | Label, error, required, description rendering           |
| Auto-render form fields    | `components/DFormItems.vue` | Iterates schema.properties, renders DFormItem per field |
| Add form item layout       | `components/`               | DFormItem, DFormItems                                   |
| Add renderer feature       | `renderer/index.ts`         | Global Map registry + createFormContext()               |

## KEY PATTERNS

**Reactivity bridge (manual, NOT core's reactive/):**

- `useForm`: calls `syncState()` after every mutation to sync Vue refs with core state
- `useField`: subscribes to `field.on('valueChange'|'stateChange')` events for automatic updates
- Form-level sync is manual; field-level sync is event-driven (inconsistent but functional)

**Provide/inject:**

- Key: `'d-form'` (string literal, no InjectionKey — typed as `any` in DField)
- DForm provides: useForm return + DFormContext (registry methods)
- DField injects and accesses `form` property + `getComponent()`
- DForm now provides `schema` and `uiSchema` in context alongside form methods and registry
- DFormItem consumes `uiSchema` for layout (labelWidth, labelPosition, colon, showRequiredAsterisk)
- DFormItems reads `schema` from injected context and auto-renders DFormItem for each property

**Component registry:**

- Global `Map<string, Component>` singleton + local per-form override via `createFormContext()`
- Resolution order: local registry → global registry → native `<input>` fallback
- No namespacing — component names must be globally unique

## ANTI-PATTERNS

- `useForm` has empty `onUnmounted` — core Form instance never disposed
- Inject typed as `any` — no compile-time safety on context shape
- `DField` doesn't merge `disabled` prop with `schema.disabled`
- Fallback input uses native `value` prop vs `modelValue` for registered components

## NOTES

- Component contract: adapters receive `modelValue`, emit `update:modelValue` + `blur`
- `renderField()` in renderer uses `h()` for programmatic VNode creation
- DForm template: `<form @submit.prevent>` with default slot — no built-in UI
