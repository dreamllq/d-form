/**
 * Reaction (linkage) types for d-form
 * Based on x-reactions protocol (Formily-style)
 */

import { z } from 'zod'
import { FieldSchema, FieldState } from './field'

export const ReactionEffect = z.object({
  /** State changes to apply */
  get state() {
    return FieldState.partial().optional()
  },
  /** Schema changes to apply */
  get schema() {
    return FieldSchema.partial().optional()
  },
  /** Custom action to execute (expression string) */
  run: z.string().optional(),
})

export type ReactionEffect = z.infer<typeof ReactionEffect>

export const ReactionConfig = z.object({
  /** Field paths this reaction depends on */
  dependencies: z.array(z.string()).optional(),
  /** Target field(s) to affect */
  target: z.union([z.string(), z.array(z.string())]).optional(),
  /** Condition expression (when to apply fulfill) */
  when: z.string().optional(),
  /** Effect to apply when condition is true */
  fulfill: ReactionEffect.optional(),
  /** Effect to apply when condition is false */
  otherwise: ReactionEffect.optional(),
})

export type ReactionConfig = z.infer<typeof ReactionConfig>

export const ReactionSchema = z.object({
  /** Reaction type */
  type: z.enum(['linkage', 'effect', 'computed']).optional(),
  /** Field paths this reaction depends on */
  dependencies: z.array(z.string()).optional(),
  /** Target field(s) to affect */
  target: z.union([z.string(), z.array(z.string())]).optional(),
  /** Condition expression */
  when: z.string().optional(),
  /** Effect when condition is true */
  fulfill: ReactionEffect.optional(),
  /** Effect when condition is false */
  otherwise: ReactionEffect.optional(),
  /** Computed value expression */
  expression: z.string().optional(),
  /** Custom reaction executor name */
  executor: z.string().optional(),
})

export type ReactionSchema = z.infer<typeof ReactionSchema>

export const ReactionContext = z.object({
  /** Current field value */
  $self: z.any(),
  /** Dependency field values */
  $deps: z.record(z.string(), z.any()),
  /** Form instance reference */
  $form: z.any(),
  /** All form values */
  $values: z.record(z.string(), z.any()),
  /** Field path */
  $path: z.string(),
  /** Field schema */
  get $schema() {
    return FieldSchema
  },
  /** Field state */
  get $state() {
    return FieldState
  },
})

export type ReactionContext = z.infer<typeof ReactionContext>

/**
 * ReactionEvaluator — kept as TypeScript type (function type).
 */
export type ReactionEvaluator = (expression: string, context: ReactionContext) => any

/**
 * ReactionExecutor — kept as TypeScript interface (contains methods).
 */
export interface ReactionExecutor {
  /** Executor name */
  name: string
  /** Executor function */
  execute: (context: ReactionContext, config: ReactionConfig) => void | Promise<void>
}
