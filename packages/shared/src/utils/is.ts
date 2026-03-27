/**
 * Type checking utility functions
 */

export const isPlainObject = (val: unknown): val is Record<string, any> =>
  Object.prototype.toString.call(val) === '[object Object]'

export const isArray = Array.isArray

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'

export const isString = (val: unknown): val is string =>
  typeof val === 'string'

export const isNumber = (val: unknown): val is number =>
  typeof val === 'number'

export const isBoolean = (val: unknown): val is boolean =>
  typeof val === 'boolean'

export const isNull = (val: unknown): val is null => val === null

export const isUndefined = (val: unknown): val is undefined =>
  val === undefined

export const isSymbol = (val: unknown): val is symbol =>
  typeof val === 'symbol'

export const isBigInt = (val: unknown): val is bigint =>
  typeof val === 'bigint'

export const isObject = (val: unknown): val is Record<string, any> =>
  val !== null && typeof val === 'object'

export const isDate = (val: unknown): val is Date => val instanceof Date

export const isRegExp = (val: unknown): val is RegExp => val instanceof RegExp

export const isEmpty = (val: unknown): boolean => {
  if (isNull(val) || isUndefined(val)) return true
  if (isArray(val) || isString(val)) return val.length === 0
  if (isPlainObject(val)) return Object.keys(val).length === 0
  return false
}
