# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-28
**Commit:** 11d8e68
**Branch:** main

## OVERVIEW

Schema-driven dynamic form library. TypeScript monorepo with pnpm workspaces + Turborepo. Core form engine is framework-agnostic; Vue 3 integration via separate package layer.

## STRUCTURE

```
d-form/
├── packages/
│   ├── shared/         # @d-form/shared — types, utils, i18n (zero deps)
│   ├── core/           # @d-form/core — form engine, reactive, validation, expressions
│   ├── vue/            # @d-form/vue — Vue 3 composables, components, renderer
│   └── element-plus/   # @d-form/element-plus — Element Plus UI adapters
├── apps/demo/          # Demo app (Vue 3 + Element Plus + vue-router)
├── docs/               # architecture.md, api.md, schema-spec.md, getting-started.md
└── spikes/reactive/    # Experimental reactive system spike (NOT production)
```

**Dependency chain:** `shared → core → vue → element-plus`

## WHERE TO LOOK

| Task                        | Location                                            | Notes                                       |
| --------------------------- | --------------------------------------------------- | ------------------------------------------- |
| Add a new type/interface    | `packages/shared/src/types/`                        | All shared types live here                  |
| Add a utility function      | `packages/shared/src/utils/`                        | Deep path access, clone, merge, type guards |
| Add i18n locale/translation | `packages/shared/src/i18n/`                         | `createI18n()`, en + zh-CN                  |
| Add form/field logic        | `packages/core/src/models/`                         | Form, Field, Reaction classes               |
| Add reactive system feature | `packages/core/src/reactive/`                       | Custom observable/autorun/Tracker           |
| Add expression syntax       | `packages/core/src/expression/`                     | Compiler, `{{expr}}` DSL                    |
| Add validation rule         | `packages/core/src/validation.ts`                   | Built-in rules + zod integration            |
| Add Vue composable          | `packages/vue/src/composables/`                     | useForm, useField                           |
| Add Vue component           | `packages/vue/src/components/`                      | DForm, DField                               |
| Register renderer component | `packages/vue/src/renderer/`                        | Global registry, createRenderer             |
| Add Element Plus adapter    | `packages/element-plus/src/adapters/`               | InputAdapter, SelectAdapter, etc.           |
| Fix a build issue           | Each package has `vite.config.ts` + `tsconfig.json` |                                             |
| Run the demo                | `apps/demo/`                                        | `pnpm --filter @d-form/demo dev`            |

## CONVENTIONS

- **No semicolons**, single quotes, 100-char print width, trailing comma es5
- TypeScript strict: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `any` is `warn` not error; underscore-prefixed vars exempt from unused checks
- No explicit return types required (eslint rule off)
- `console.warn`/`console.error` allowed; `console.log` warns
- All packages output ESM + CJS with sourcemaps, no minification
- Library builds: `vite build` (runtime) + `tsc --build` (declarations)
- Tests co-located in `src/__tests__/*.test.ts` with Vitest

## ANTI-PATTERNS (THIS PROJECT)

- `spikes/` is experimental code — never import from it
- Expression compiler uses `with` statement (deprecated in strict mode) — intentional trade-off for DSL
- `validation.ts` + `validation/index.ts` split: barrel re-exports from sibling file + own directory
- No CI/CD pipeline — all builds/tests are manual

## UNIQUE STYLES

- Custom reactive system (`observable`/`autorun`/`Tracker`) decoupled from Vue reactivity
- Expression DSL: `{{expression}}` strings compiled via `new Function()` with sandboxed scope (`$self`, `$deps`, `$values`, `$form`)
- Component registry pattern: adapters register by string name, renderer resolves at runtime
- Schema-driven: forms described as serializable `FormSchema` objects, not template trees

## COMMANDS

```bash
# Monorepo (via Turbo)
pnpm build          # Build all packages (respects dependency order)
pnpm test           # Run tests (depends on build)
pnpm type-check     # TypeScript checking
pnpm lint           # ESLint
pnpm dev            # Start all dev servers
pnpm clean          # Remove dist/ + node_modules

# Single package
pnpm --filter @d-form/core build
pnpm --filter @d-form/core test
pnpm --filter @d-form/shared test:coverage

# Formatting
pnpm format         # Prettier write
pnpm format:check   # Prettier check
```

## NOTES

- Node >=20.0.0, pnpm >=9.0.0 (engine constraints in root package.json)
- zod is a peerDep of `@d-form/core` — consumers must install it separately
- `@d-form/shared` has secondary entry point `./types` for type-only imports
- Vue packages use `vue-tsc` for type-checking (not plain `tsc`)
- Element Plus tests run in `jsdom` environment; core/shared use Node
