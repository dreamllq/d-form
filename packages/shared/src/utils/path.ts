/**
 * Get a value from an object by path
 * @param obj - The object to get value from
 * @param path - The path to the value (e.g., 'a.b.c')
 * @param defaultValue - The default value if path doesn't exist
 * @returns The value at the path or defaultValue
 */
export function get(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.').filter(Boolean)
  let result = obj

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue
    }
    result = result[key]
  }

  return result ?? defaultValue
}

/**
 * Set a value in an object by path
 * @param obj - The object to set value in
 * @param path - The path to set the value (e.g., 'a.b.c')
 * @param value - The value to set
 * @returns The modified object
 */
export function set(obj: any, path: string, value: any): any {
  const keys = path.split('.').filter(Boolean)

  if (keys.length === 0) {
    return obj
  }

  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current)) {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
  return obj
}

/**
 * Check if a path exists in an object
 * @param obj - The object to check
 * @param path - The path to check
 * @returns Whether the path exists
 */
export function has(obj: any, path: string): boolean {
  const keys = path.split('.').filter(Boolean)
  let current = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return false
    }
    if (!(key in current)) {
      return false
    }
    current = current[key]
  }

  return true
}
