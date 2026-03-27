/**
 * Expression module exports
 * Provides expression compilation and evaluation for dynamic form logic
 */

export type { CompileOptions, ExpressionScope, Evaluator } from './types'

export {
  compile,
  isExpression,
  clearCache,
  getCacheSize,
  shallowCompile,
} from './compiler'
