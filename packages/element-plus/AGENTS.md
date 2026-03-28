# @d-form/element-plus

Element Plus UI adapter components. Depends on all 3 packages + element-plus + vue. ~320 lines of adapter code.

## STRUCTURE

```
src/
├── adapters/      # 8 Vue SFC adapters (32–51 lines each)
│   ├── InputAdapter.vue       → el-input
│   ├── SelectAdapter.vue      → el-select + el-option
│   ├── DatePickerAdapter.vue  → el-date-picker
│   ├── CheckboxAdapter.vue    → el-checkbox
│   ├── RadioAdapter.vue       → el-radio-group + el-radio
│   ├── SwitchAdapter.vue      → el-switch
│   ├── InputNumberAdapter.vue → el-input-number
│   └── TextareaAdapter.vue    → el-input type="textarea"
└── index.ts       # Exports + registerElementPlusComponents()
```

## WHERE TO LOOK

| Task                    | File                      | Notes                                           |
| ----------------------- | ------------------------- | ----------------------------------------------- |
| Add new adapter         | `adapters/NewAdapter.vue` | Follow existing pattern, register in index.ts   |
| Modify adapter behavior | `adapters/*.vue`          | Each is self-contained                          |
| Change registration     | `index.ts`                | registerElementPlusComponents() registers all 8 |

## ADAPTER CONTRACT

Every adapter receives identical props: `name`, `modelValue`, `schema?`, `error?`, `touched?`, `disabled?`
Emits: `update:modelValue`, `blur`
Always applies: `:class="{ 'is-error': error }"`

Schema-derived config via `computed(() => props.schema?.prop)`:

- **InputAdapter**: `placeholder`
- **SelectAdapter**: `placeholder`, `options` (as `{label,value}[]`), `clearable` (default true)
- **DatePickerAdapter**: `placeholder`, `clearable`, `dateType`, `format`, `valueFormat`
- **CheckboxAdapter**: `label`
- **RadioAdapter**: `options` (as `{label,value}[]`)
- **SwitchAdapter**: `activeText`, `inactiveText`
- **InputNumberAdapter**: `placeholder`, `min`, `max`, `step`, `precision`, `controls` (default true)
- **TextareaAdapter**: `placeholder`, `rows` (default 2), `autosize`, `maxlength`, `showWordLimit`

## ADDING A NEW ADAPTER

1. Create `adapters/YourAdapter.vue` — copy InputAdapter as template
2. Bind `:model-value`, `:disabled`, error class, emit both events
3. Add computed props for schema-derived UI config
4. Export from `adapters/index.ts`
5. Import + export from `src/index.ts`
6. Add `registerComponent('your-name', YourAdapter)` to `registerElementPlusComponents()`

## ANTI-PATTERNS

- Adapters read `props.schema?.options` but FieldSchema defines `enum` — inconsistency
- `componentProps` on schema is NOT read by adapters — put props directly on schema
- All schema prop accesses need `as Type | undefined` type assertion
- `is-error` CSS class is NOT from Element Plus — consumers must define it
- TextareaAdapter uses `el-input type="textarea"`, not a separate component
- Tests run in `jsdom` environment (not Node)

## NOTES

- Registration names are lowercase kebab-case: `'date-picker'`, `'input-number'`
- Call `registerElementPlusComponents()` once at app startup
- PeerDeps: `element-plus ^2.8.0`, `vue ^3.4.0`
