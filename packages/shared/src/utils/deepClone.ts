import { isPlainObject, isArray, isDate, isRegExp } from './is'

/**
 * Deep clone an object
 * @param obj - The object to clone
 * @returns A deep copy of the object
 */
export function deepClone<T>(obj: T): T {
  // Handle primitives and null
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // Handle Date
  if (isDate(obj)) {
    return new Date(obj.getTime()) as T
  }

  // Handle RegExp
  if (isRegExp(obj)) {
    return new RegExp(obj.source, obj.flags) as T
  }

  // Handle Array
  if (isArray(obj)) {
    return obj.map((item) => deepClone(item)) as T
  }

  // Handle plain objects
  if (isPlainObject(obj)) {
    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  // Return other objects as-is (Map, Set, etc.)
  return obj
}
