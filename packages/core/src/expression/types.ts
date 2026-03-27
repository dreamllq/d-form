/**
 * Expression compiler types for @d-form/core
 * Supports {{expression}} syntax with scope variables
 */

/**
 * Options for expression compilation
 */
export interface CompileOptions {
  /** Suppress errors when true */
  silent?: boolean
}

/**
 * Expression scope variables available in expressions
 * These are accessible directly in {{expression}} syntax
 */
export interface ExpressionScope {
  /** Current field's value */
  $self?: any
  /** Dependencies array from other fields */
  $deps?: any[]
  /** Form instance reference */
  $form?: any
  /** All form values */
  $values?: any
  /** Additional custom properties */
  [key: string]: any
}

/**
 * Evaluator function type
 * Takes expression string and scope, returns evaluated result
 */
export type Evaluator = (expression: string, scope: ExpressionScope) => any
