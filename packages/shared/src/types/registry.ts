/**
 * Component registry types for type-safe componentProps.
 *
 * Provides a mechanism to define typed component prop schemas
 * that integrate with FormSchema/FieldSchema for IDE autocomplete
 * and type checking.
 */

import type { z } from 'zod'
import type { FieldSchema } from './field'
import type { FormSchema } from './form'

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
type FieldSchemaBase = Omit<FieldSchema, 'component' | 'componentProps'>

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
