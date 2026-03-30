/**
 * Component registry types for type-safe componentProps.
 *
 * Provides a mechanism to define typed component prop schemas
 * that integrate with FormSchema/FieldSchema for IDE autocomplete
 * and type checking.
 */

import { z } from 'zod'
import { FieldSchema } from './field'
import type { FieldSchema as FieldSchemaType } from './field'
import { FormSchema } from './form'

/**
 * Registry type: maps component name to its zod schema.
 * Each key is a component name, each value is a zod schema
 * describing that component's props.
 */
export type ComponentPropsRegistry = Record<string, z.ZodTypeAny>

/**
 * Base field schema without component/componentProps.
 * Used as the foundation for WrapFieldSchema's discriminated union.
 */
type FieldSchemaBase = Omit<FieldSchemaType, 'component' | 'componentProps'>

/**
 * WrapFieldSchema: provides typed componentProps based on the component field value.
 *
 * When `component` is a known key in the Registry, `componentProps` is typed
 * as the inferred type of that registry entry's zod schema.
 *
 * When `component` is missing or an unknown string, `componentProps`
 * falls back to `Record<string, any>`.
 *
 * Uses a discriminated union: for each key K in Registry, creates a variant
 * `{ component: K, componentProps?: z.infer<Registry[K]> }`, plus a fallback
 * `{ component?: string, componentProps?: Record<string, any> }`.
 */
export type WrapFieldSchema<Registry extends ComponentPropsRegistry> = FieldSchemaBase &
  (
    | {
        [K in keyof Registry]: {
          component: K
          componentProps?: z.infer<Registry[K]>
        }
      }[keyof Registry]
    | {
        component?: string
        componentProps?: Record<string, any>
      }
  )

/**
 * WrapFormSchema: applies WrapFieldSchema to FormSchema's properties.
 *
 * All other FormSchema fields (type, uiSchema, reactions, etc.) are preserved.
 * Only the `properties` field is re-typed to use WrapFieldSchema for
 * per-component componentProps typing.
 */
export type WrapFormSchema<Registry extends ComponentPropsRegistry> = Omit<
  FormSchema,
  'properties'
> & {
  properties: Record<string, WrapFieldSchema<Registry>>
}

/**
 * defineComponentRegistry: identity function at runtime, provides type
 * inference at compile time.
 *
 * Usage:
 * ```ts
 * const registry = defineComponentRegistry({
 *   input: z.object({ placeholder: z.string().optional() }),
 *   select: z.object({ options: z.array(z.object({ label: z.string(), value: z.any() })) }),
 * })
 * ```
 */
export function defineComponentRegistry<R extends ComponentPropsRegistry>(registry: R): R {
  return registry
}

/**
 * defineFormSchema: identity function at runtime, provides type inference
 * for componentProps based on the registry.
 *
 * Pass the registry for type inference and the form schema. The schema's
 * `componentProps` fields will be typed based on the `component` value
 * matching registry keys.
 *
 * Usage:
 * ```ts
 * const schema = defineFormSchema(registry, {
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string', component: 'input', componentProps: { placeholder: 'Enter name' } },
 *   },
 * })
 * ```
 */
export function defineFormSchema<R extends ComponentPropsRegistry>(
  _registry: R,
  schema: WrapFormSchema<R>
): FormSchema {
  return schema as FormSchema
}

/**
 * assembleFormSchema: creates a new FormSchema zod schema where each field's
 * `component` and `componentProps` are linked via discriminated union.
 *
 * **Designed for LangChain tool usage** — the returned zod schema:
 * 1. Converts to JSON Schema with `oneOf`, where each variant binds a specific
 *    `component` const (e.g. `"input"`) to its precise `componentProps` schema.
 *    LLMs see exactly which props each component accepts.
 * 2. Validates at runtime: `component: 'input'` → `componentProps` must match
 *    the input props schema from the registry.
 * 3. Only components registered in the registry are accepted — unknown component
 *    values will fail validation.
 *
 * The registry is consumed at call time, so dynamically assembled registries
 * work naturally (e.g. spreading `elementPlusRegistry` with custom entries).
 *
 * Handles nested fields (`properties` for objects, `items` for arrays) recursively.
 *
 * Usage:
 * ```ts
 * const registry = defineComponentRegistry({
 *   input: z.object({ placeholder: z.string().optional() }),
 *   select: z.object({ options: z.array(z.object({ label: z.string(), value: z.any() })) }),
 * })
 *
 * // Pass to LangChain tool
 * const formTool = tool(async (input) => { ... }, {
 *   name: 'create_form',
 *   schema: assembleFormSchema(registry),
 * })
 *
 * // Or use standalone
 * const schema = assembleFormSchema(registry)
 * const result = schema.safeParse(formData)
 * ```
 */
export function assembleFormSchema(registry: ComponentPropsRegistry) {
  // Strip component/componentProps from the base FieldSchema — we'll add them
  // back via discriminated union with per-component typing.
  const baseShape = FieldSchema.omit({ component: true, componentProps: true })

  const entries = Object.entries(registry)

  // If registry is empty, use plain base shape.
  if (entries.length === 0) {
    return FormSchema.extend({
      properties: z.record(
        z.string(),
        baseShape.extend({
          component: z.string().optional(),
          componentProps: z.record(z.string(), z.any()).optional(),
        })
      ),
    })
  }

  // Build one variant per registry entry:
  //   { component: z.literal('input'), componentProps: inputPropsSchema.optional(), ...base }
  const [first, ...rest] = entries.map(([name, propsSchema]) =>
    baseShape.extend({
      component: z.literal(name),
      componentProps: propsSchema.optional(),
    })
  )

  // discriminatedUnion on `component` — JSON Schema produces oneOf with const discriminators
  const EnhancedFieldSchema = z.discriminatedUnion('component', [first, ...rest])

  return FormSchema.extend({
    properties: z.record(z.string(), EnhancedFieldSchema),
  })
}
