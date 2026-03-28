# @d-form/core

Framework-agnostic form engine. Depends on `@d-form/shared`. ~1,600 lines of source.

## STRUCTURE

```
src/
├── models/        # Form (449), Field (273), Reaction (172) — core orchestration
├── reactive/      # observable, autorun, Tracker — custom reactivity (UNUSED currently)
├── expression/    # compiler (171) — {{expr}} DSL with caching
├── validation.ts  # Built-in rules (227) + zod.ts (187)
└── index.ts       # Barrel: re-exports shared + all modules
```

## WHERE TO LOOK

| Task                         | File                     | Notes                                                             |
| ---------------------------- | ------------------------ | ----------------------------------------------------------------- |
| Add form state/methods       | `models/form.ts`         | Form class + createForm() factory                                 |
| Add field behavior           | `models/field.ts`        | Field class, event emitter, validation trigger                    |
| Add reaction/linkage logic   | `models/reaction.ts`     | Reaction class, expression evaluation                             |
| Add expression scope vars    | `expression/compiler.ts` | Compile cache, scope: `$self`/`$deps`/`$values`/`$form`           |
| Add built-in validation rule | `validation.ts`          | `required`/`min`/`max`/`minLength`/`maxLength`/`pattern`/`custom` |
| Add zod integration          | `validation/zod.ts`      | Shape introspection, error mapping                                |

## KEY PATTERNS

**Form↔Field interaction:**

- Form stores `_values` (plain object) + `_fields` (Map<string, Field>)
- Field emits `valueChange`/`touchedChange`/`stateChange` events
- Field calls `_form._notifyFieldValueChange()` to sync parent
- Reactions subscribe to Field events, NOT to the reactive/ module

**Validation integration:**

- Field.validate() auto-detects sync vs async by checking rule types
- Returns `ValidationResult | Promise<ValidationResult>` — callers must handle both
- Built-in rules stop at first error (fail-fast)
- `validateVisibleOnly: true` skips hidden fields

**Expression↔Reaction integration:**

- Reaction builds scope with `$self`, `$values`, `$form`, `$deps`
- `compile(expr, scope)` uses `new Function()` with `with` statement
- Compiled functions are cached by code string

## ANTI-PATTERNS

- `reactive/` module is unused — Form/Field use event emitters instead. Do not rely on `observable`/`autorun`
- `validation.ts` + `validation/index.ts` split: barrel re-exports from sibling file AND own directory
- `validation/zod.ts` accesses `schema._def?.shape` — internal zod API, may break on zod upgrades
- `Field.validate()` hybrid return type: always check if result is Promise before accessing `.valid`

## NOTES

- `createForm()` accepts optional `zodSchema` for whole-form zod validation
- Reactions with `when` condition execute immediately on construction
- `Reaction.dispose()` does NOT revert previously applied state changes
- `createValidator()` factory returns a reusable validation function
