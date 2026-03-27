/**
 * Expression compiler with caching support
 * Compiles {{expression}} syntax into evaluator functions
 */

import type { CompileOptions, ExpressionScope, Evaluator } from './types'

/** Expression regex: matches {{ ... }} pattern */
const EXP_REGEX = /^\s*\{\{([\s\S]*)\}\}\s*$/

/** Cache for compiled expressions */
const cache = new Map<string, Evaluator>()

/**
 * Compile an expression string into an evaluator function
 * 
 * @param expression - The expression string to compile (e.g., "{{ $self.value }}")
 * @param scope - The scope object containing variables accessible in the expression
 * @param options - Compilation options
 * @returns The evaluated result, or the original string if not an expression
 * 
 * @example
 * ```ts
 * compile('{{$self.value + 1}}', { $self: { value: 10 } })
 * // Returns: 11
 * 
 * compile('plain text', { $self: { value: 10 } })
 * // Returns: 'plain text'
 * ```
 */
export function compile(
  expression: string,
  scope: ExpressionScope,
  options: CompileOptions = {}
): any {
  // Check if it's an expression
  const match = expression.match(EXP_REGEX)

  if (!match) {
    return expression // Return as-is if not an expression
  }

  const code = match[1].trim()

  // Check cache
  let evaluator = cache.get(code)

  if (!evaluator) {
    // Create safe evaluator using Function constructor
    evaluator = createEvaluator(code, options)
    cache.set(code, evaluator)
  }

  return evaluator(expression, scope)
}

/**
 * Create a safe evaluator function
 * Uses Function constructor with 'with' statement for safe scope access
 * 
 * @param code - The expression code to evaluate
 * @param options - Compilation options
 * @returns An evaluator function
 */
function createEvaluator(code: string, options: CompileOptions): Evaluator {
  const { silent = false } = options

  try {
    // Use Function constructor with 'with' for safe scope access
    // Note: 'with' is deprecated in strict mode but useful here for DSL
    // The 'with' statement allows us to access scope properties directly
    const fn = new Function(
      '$scope',
      `with($scope) { return (${code}); }`
    )

    return (expression: string, scope: ExpressionScope) => {
      try {
        return fn(scope)
      } catch (e) {
        if (!silent) {
          console.warn(`Expression evaluation error: ${expression}`, e)
        }
        return undefined
      }
    }
  } catch (e) {
    if (!silent) {
      console.error(`Expression compilation error: ${code}`, e)
    }
    // Return a function that always returns undefined
    return () => undefined
  }
}

/**
 * Check if a string is an expression (matches {{...}} pattern)
 * 
 * @param str - The string to check
 * @returns true if the string is an expression
 * 
 * @example
 * ```ts
 * isExpression('{{$self.value}}') // true
 * isExpression('plain text') // false
 * isExpression('  {{  code  }}  ') // true
 * ```
 */
export function isExpression(str: string): boolean {
  return EXP_REGEX.test(str)
}

/**
 * Clear the expression cache
 * Useful for testing or when you want to recompile all expressions
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Get cache size (useful for debugging/testing)
 * @returns The number of cached evaluators
 */
export function getCacheSize(): number {
  return cache.size
}

/**
 * Shallow compile - processes expressions in strings, arrays, and objects
 * Recursively traverses the source and compiles any string expressions found
 * 
 * @param source - The source value to compile (string, array, object, or primitive)
 * @param scope - The scope object for expression evaluation
 * @param options - Compilation options
 * @returns The compiled result with expressions evaluated
 * 
 * @example
 * ```ts
 * shallowCompile(
 *   { label: '{{$self.name}}', value: 123 },
 *   { $self: { name: 'John' } }
 * )
 * // Returns: { label: 'John', value: 123 }
 * ```
 */
export function shallowCompile(
  source: any,
  scope: ExpressionScope,
  options: CompileOptions = {}
): any {
  if (typeof source === 'string') {
    return compile(source, scope, options)
  }

  if (Array.isArray(source)) {
    return source.map((item) => shallowCompile(item, scope, options))
  }

  if (source && typeof source === 'object') {
    const result: any = {}
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        result[key] = shallowCompile(source[key], scope, options)
      }
    }
    return result
  }

  return source
}
