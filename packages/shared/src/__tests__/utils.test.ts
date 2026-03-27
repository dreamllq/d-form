import { describe, it, expect } from 'vitest'
import {
  deepClone,
  deepMerge,
  isPlainObject,
  isArray,
  isFunction,
  isString,
  isNumber,
  isBoolean,
  isNull,
  isUndefined,
  isSymbol,
  isBigInt,
  isObject,
  isDate,
  isRegExp,
  isEmpty,
  get,
  set,
  has,
} from '../utils'

describe('deepClone', () => {
  it('should clone primitives', () => {
    expect(deepClone(1)).toBe(1)
    expect(deepClone('string')).toBe('string')
    expect(deepClone(true)).toBe(true)
    expect(deepClone(null)).toBe(null)
    expect(deepClone(undefined)).toBe(undefined)
  })

  it('should clone arrays', () => {
    const arr = [1, 2, 3]
    const cloned = deepClone(arr)
    expect(cloned).toEqual(arr)
    expect(cloned).not.toBe(arr)
  })

  it('should clone nested arrays', () => {
    const arr = [[1, 2], [3, 4]]
    const cloned = deepClone(arr)
    expect(cloned).toEqual(arr)
    expect(cloned[0]).not.toBe(arr[0])
  })

  it('should clone plain objects', () => {
    const obj = { a: 1, b: 2 }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned).not.toBe(obj)
  })

  it('should clone nested objects', () => {
    const obj = { a: { b: { c: 1 } } }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned.a).not.toBe(obj.a)
    expect(cloned.a.b).not.toBe(obj.a.b)
  })

  it('should clone Date objects', () => {
    const date = new Date('2024-01-01')
    const cloned = deepClone(date)
    expect(cloned).toEqual(date)
    expect(cloned).not.toBe(date)
  })

  it('should clone RegExp objects', () => {
    const regex = /test/g
    const cloned = deepClone(regex)
    expect(cloned.source).toBe(regex.source)
    expect(cloned.flags).toBe(regex.flags)
    expect(cloned).not.toBe(regex)
  })

  it('should clone complex nested structures', () => {
    const obj = {
      a: 1,
      b: [1, 2, { c: 3 }],
      d: { e: new Date('2024-01-01'), f: /pattern/g },
    }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned.b).not.toBe(obj.b)
    expect(cloned.d).not.toBe(obj.d)
  })
})

describe('deepMerge', () => {
  it('should merge shallow objects', () => {
    const target = { a: 1 }
    const source = { b: 2 }
    expect(deepMerge(target, source as any)).toEqual({ a: 1, b: 2 })
  })

  it('should deep merge nested objects', () => {
    const target = { a: { b: 1 } }
    const source = { a: { c: 2 } }
    expect(deepMerge(target, source as any)).toEqual({ a: { b: 1, c: 2 } })
  })

  it('should override with source values', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3 }
    expect(deepMerge(target, source)).toEqual({ a: 1, b: 3 })
  })

  it('should merge multiple sources', () => {
    const target = { a: 1 }
    const source1 = { b: 2 }
    const source2 = { c: 3 }
    expect(deepMerge(target, source1 as any, source2 as any)).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should return target if no sources', () => {
    const target = { a: 1 }
    expect(deepMerge(target)).toBe(target)
  })

  it('should handle arrays by replacing', () => {
    const target = { a: [1, 2] }
    const source = { a: [3, 4] }
    expect(deepMerge(target, source)).toEqual({ a: [3, 4] })
  })
})

describe('isPlainObject', () => {
  it('should return true for plain objects', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ a: 1 })).toBe(true)
  })

  it('should return false for non-plain objects', () => {
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(new Date())).toBe(false)
    expect(isPlainObject(/regex/)).toBe(false)
    expect(isPlainObject(1)).toBe(false)
    expect(isPlainObject('string')).toBe(false)
  })
})

describe('isArray', () => {
  it('should return true for arrays', () => {
    expect(isArray([])).toBe(true)
    expect(isArray([1, 2, 3])).toBe(true)
  })

  it('should return false for non-arrays', () => {
    expect(isArray({})).toBe(false)
    expect(isArray('string')).toBe(false)
    expect(isArray(null)).toBe(false)
  })
})

describe('isFunction', () => {
  it('should return true for functions', () => {
    expect(isFunction(() => {})).toBe(true)
    expect(isFunction(function () {})).toBe(true)
    expect(isFunction(async () => {})).toBe(true)
  })

  it('should return false for non-functions', () => {
    expect(isFunction({})).toBe(false)
    expect(isFunction('string')).toBe(false)
    expect(isFunction(null)).toBe(false)
  })
})

describe('isString', () => {
  it('should return true for strings', () => {
    expect(isString('')).toBe(true)
    expect(isString('hello')).toBe(true)
  })

  it('should return false for non-strings', () => {
    expect(isString(123)).toBe(false)
    expect(isString(null)).toBe(false)
  })
})

describe('isNumber', () => {
  it('should return true for numbers', () => {
    expect(isNumber(0)).toBe(true)
    expect(isNumber(123)).toBe(true)
    expect(isNumber(-5)).toBe(true)
    expect(isNumber(3.14)).toBe(true)
  })

  it('should return false for non-numbers', () => {
    expect(isNumber('123')).toBe(false)
    expect(isNumber(null)).toBe(false)
  })

  it('should return true for NaN (JavaScript quirk)', () => {
    expect(isNumber(NaN)).toBe(true)
  })
})

describe('isBoolean', () => {
  it('should return true for booleans', () => {
    expect(isBoolean(true)).toBe(true)
    expect(isBoolean(false)).toBe(true)
  })

  it('should return false for non-booleans', () => {
    expect(isBoolean(1)).toBe(false)
    expect(isBoolean('true')).toBe(false)
    expect(isBoolean(null)).toBe(false)
  })
})

describe('isNull', () => {
  it('should return true for null', () => {
    expect(isNull(null)).toBe(true)
  })

  it('should return false for non-null', () => {
    expect(isNull(undefined)).toBe(false)
    expect(isNull(0)).toBe(false)
    expect(isNull('')).toBe(false)
  })
})

describe('isUndefined', () => {
  it('should return true for undefined', () => {
    expect(isUndefined(undefined)).toBe(true)
    expect(isUndefined(void 0)).toBe(true)
  })

  it('should return false for non-undefined', () => {
    expect(isUndefined(null)).toBe(false)
    expect(isUndefined(0)).toBe(false)
    expect(isUndefined('')).toBe(false)
  })
})

describe('isSymbol', () => {
  it('should return true for symbols', () => {
    expect(isSymbol(Symbol())).toBe(true)
    expect(isSymbol(Symbol('test'))).toBe(true)
  })

  it('should return false for non-symbols', () => {
    expect(isSymbol('symbol')).toBe(false)
    expect(isSymbol(null)).toBe(false)
  })
})

describe('isBigInt', () => {
  it('should return true for bigints', () => {
    expect(isBigInt(BigInt(123))).toBe(true)
    expect(isBigInt(123n)).toBe(true)
  })

  it('should return false for non-bigints', () => {
    expect(isBigInt(123)).toBe(false)
    expect(isBigInt(null)).toBe(false)
  })
})

describe('isObject', () => {
  it('should return true for objects', () => {
    expect(isObject({})).toBe(true)
    expect(isObject([])).toBe(true)
    expect(isObject(new Date())).toBe(true)
  })

  it('should return false for non-objects', () => {
    expect(isObject(null)).toBe(false)
    expect(isObject(123)).toBe(false)
    expect(isObject('string')).toBe(false)
  })
})

describe('isDate', () => {
  it('should return true for Date objects', () => {
    expect(isDate(new Date())).toBe(true)
  })

  it('should return false for non-Date objects', () => {
    expect(isDate({})).toBe(false)
    expect(isDate('2024-01-01')).toBe(false)
  })
})

describe('isRegExp', () => {
  it('should return true for RegExp objects', () => {
    expect(isRegExp(/test/)).toBe(true)
    expect(isRegExp(new RegExp('test'))).toBe(true)
  })

  it('should return false for non-RegExp objects', () => {
    expect(isRegExp({})).toBe(false)
    expect(isRegExp('/test/')).toBe(false)
  })
})

describe('isEmpty', () => {
  it('should return true for empty values', () => {
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty('')).toBe(true)
    expect(isEmpty([])).toBe(true)
    expect(isEmpty({})).toBe(true)
  })

  it('should return false for non-empty values', () => {
    expect(isEmpty('hello')).toBe(false)
    expect(isEmpty([1])).toBe(false)
    expect(isEmpty({ a: 1 })).toBe(false)
    expect(isEmpty(0)).toBe(false)
  })
})

describe('get', () => {
  it('should get value by simple path', () => {
    const obj = { a: 1 }
    expect(get(obj, 'a')).toBe(1)
  })

  it('should get value by nested path', () => {
    const obj = { a: { b: { c: 3 } } }
    expect(get(obj, 'a.b.c')).toBe(3)
  })

  it('should return defaultValue for non-existent path', () => {
    const obj = { a: 1 }
    expect(get(obj, 'b', 'default')).toBe('default')
  })

  it('should return undefined for non-existent path without default', () => {
    const obj = { a: 1 }
    expect(get(obj, 'b')).toBeUndefined()
  })

  it('should handle null/undefined in path', () => {
    const obj = { a: null }
    expect(get(obj, 'a.b', 'default')).toBe('default')
  })

  it('should get array elements', () => {
    const obj = { a: [1, 2, 3] }
    expect(get(obj, 'a.0')).toBe(1)
    expect(get(obj, 'a.1')).toBe(2)
  })

  it('should handle empty path', () => {
    const obj = { a: 1 }
    expect(get(obj, '')).toBe(obj)
  })
})

describe('set', () => {
  it('should set value by simple path', () => {
    const obj = { a: 1 }
    set(obj, 'b', 2)
    expect(obj).toEqual({ a: 1, b: 2 })
  })

  it('should set value by nested path', () => {
    const obj = {}
    set(obj, 'a.b.c', 3)
    expect(obj).toEqual({ a: { b: { c: 3 } } })
  })

  it('should overwrite existing values', () => {
    const obj = { a: 1 }
    set(obj, 'a', 2)
    expect(obj).toEqual({ a: 2 })
  })

  it('should return the modified object', () => {
    const obj = {}
    const result = set(obj, 'a', 1)
    expect(result).toBe(obj)
  })

  it('should handle empty path', () => {
    const obj = { a: 1 }
    const result = set(obj, '', 2)
    expect(result).toBe(obj)
  })
})

describe('has', () => {
  it('should return true for existing path', () => {
    const obj = { a: 1 }
    expect(has(obj, 'a')).toBe(true)
  })

  it('should return true for existing nested path', () => {
    const obj = { a: { b: { c: 3 } } }
    expect(has(obj, 'a.b.c')).toBe(true)
  })

  it('should return false for non-existent path', () => {
    const obj = { a: 1 }
    expect(has(obj, 'b')).toBe(false)
  })

  it('should return false for non-existent nested path', () => {
    const obj = { a: { b: 1 } }
    expect(has(obj, 'a.c')).toBe(false)
  })

  it('should return true for undefined value', () => {
    const obj = { a: undefined }
    expect(has(obj, 'a')).toBe(true)
  })
})
