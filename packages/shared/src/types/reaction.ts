/**
 * Reaction (linkage) types for d-form
 * Based on x-reactions protocol (Formily-style)
 */

import type { FieldState, FieldSchema } from './field'

export interface ReactionEffect {
  /** State changes to apply */
  state?: Partial<FieldState>
  /** Schema changes to apply */
  schema?: Partial<FieldSchema>
  /** Custom action to execute (expression string) */
  run?: string
}

export interface ReactionConfig {
  /** Field paths this reaction depends on */
  dependencies?: string[]
  /** Target field(s) to affect */
  target?: string | string[]
  /** Condition expression (when to apply fulfill) */
  when?: string
  /** Effect to apply when condition is true */
  fulfill?: ReactionEffect
  /** Effect to apply when condition is false */
  otherwise?: ReactionEffect
}

export interface ReactionSchema {
  /** Reaction type */
  type?: 'linkage' | 'effect' | 'computed'
  /** Field paths this reaction depends on */
  dependencies?: string[]
  /** Target field(s) to affect */
  target?: string | string[]
  /** Condition expression */
  when?: string
  /** Effect when condition is true */
  fulfill?: ReactionEffect
  /** Effect when condition is false */
  otherwise?: ReactionEffect
  /** Computed value expression */
  expression?: string
  /** Custom reaction executor name */
  executor?: string
}

export interface ReactionContext {
  /** Current field value */
  $self: any
  /** Dependency field values */
  $deps: Record<string, any>
  /** Form instance reference */
  $form: any
  /** All form values */
  $values: Record<string, any>
  /** Field path */
  $path: string
  /** Field schema */
  $schema: FieldSchema
  /** Field state */
  $state: FieldState
}

export type ReactionEvaluator = (
  expression: string,
  context: ReactionContext
) => any

export interface ReactionExecutor {
  /** Executor name */
  name: string
  /** Executor function */
  execute: (context: ReactionContext, config: ReactionConfig) => void | Promise<void>
}
