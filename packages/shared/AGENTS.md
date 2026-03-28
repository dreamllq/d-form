# @d-form/shared

Zero-dependency foundation. Types, utilities, i18n. ~725 lines of source.

## STRUCTURE

```
src/
├── types/         # form.ts (125), field.ts (103), validation.ts (50), reaction.ts (76)
├── utils/         # path.ts (71), deepClone.ts (42), deepMerge.ts (31), is.ts (45)
├── i18n/          # index.ts (79), locales/en.ts, locales/zh-CN.ts
└── index.ts       # VERSION + barrel exports
```

## WHERE TO LOOK

| Task                    | File                  | Notes                                              |
| ----------------------- | --------------------- | -------------------------------------------------- |
| Add type/interface      | `types/`              | All shared types; index.ts is barrel               |
| Add utility function    | `utils/`              | Deep path, clone, merge, type guards               |
| Add i18n locale         | `i18n/locales/`       | Add file + import in i18n/index.ts                 |
| Modify form schema      | `types/form.ts`       | FormSchema, FormState, FormInstance, UISchema      |
| Modify field schema     | `types/field.ts`      | FieldSchema, FieldState, FieldType union           |
| Modify validation types | `types/validation.ts` | ValidationRule, ValidationConfig, ValidationResult |
| Modify reaction types   | `types/reaction.ts`   | ReactionConfig, ReactionEffect, ReactionContext    |

## KEY TYPES

**FormSchema** — root form definition (`type: 'object'`, `properties`, `reactions`, `uiSchema`)
**FieldSchema** — field definition (`type`, `component`, `validation`, `reactions`, `enum`)
**ValidationRule** — `type` + `value` + `message` + optional `validator` function
**ReactionConfig** — `dependencies` → `when` (expression) → `fulfill`/`otherwise` effects
**ReactionContext** — expression scope: `$self`, `$deps`, `$values`, `$form`

## UTILITY GOTCHAS

- `get`/`set`/`has` — no array index support (only dot notation)
- `deepClone` — Map/Set/class instances returned by reference; circular refs cause stack overflow
- `deepMerge` — mutates target; arrays overwritten, not merged
- `isEmpty` — only handles primitives, arrays, strings, plain objects

## NOTES

- `FieldSchema.required` is UI marker only; actual validation lives in `validation.rules`
- `FieldSchema.enum` accepts `{label, value}[]` or raw `any[]`
- `FieldSchema.type` is `FieldType | string` — arbitrary strings allowed for custom components
- i18n interpolation uses `{param}` syntax (NOT `${param}` or `{{param}}`)
- Package has secondary entry point `./types` for type-only imports
- `@d-form/shared` has secondary entry point `./types` via package.json exports
