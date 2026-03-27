import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  compile,
  isExpression,
  clearCache,
  getCacheSize,
  shallowCompile,
} from '../expression'
import type { ExpressionScope } from '../expression'

describe('expression compiler', () => {
  beforeEach(() => {
    clearCache()
  })

  describe('isExpression', () => {
    it('should return true for valid expressions', () => {
      expect(isExpression('{{$self.value}}')).toBe(true)
      expect(isExpression('{{ $self.value }}')).toBe(true)
      expect(isExpression('{{$deps[0]}}')).toBe(true)
      expect(isExpression('{{$self.value + $deps[0]}}')).toBe(true)
    })

    it('should return true for expressions with whitespace', () => {
      expect(isExpression('  {{$self.value}}  ')).toBe(true)
      expect(isExpression('\t{{code}}\t')).toBe(true)
      expect(isExpression('\n{{code}}\n')).toBe(true)
    })

    it('should return false for non-expressions', () => {
      expect(isExpression('plain text')).toBe(false)
      expect(isExpression('{missing brace}')).toBe(false)
      expect(isExpression('{{unclosed')).toBe(false)
      expect(isExpression('123')).toBe(false)
      expect(isExpression('')).toBe(false)
    })

    it('should return false for single braces', () => {
      expect(isExpression('{value}')).toBe(false)
      expect(isExpression(' {value} ')).toBe(false)
    })
  })

  describe('compile', () => {
    describe('basic expression evaluation', () => {
      it('should evaluate simple arithmetic', () => {
        const scope: ExpressionScope = {}
        expect(compile('{{1 + 1}}', scope)).toBe(2)
        expect(compile('{{10 - 5}}', scope)).toBe(5)
        expect(compile('{{3 * 4}}', scope)).toBe(12)
        expect(compile('{{20 / 4}}', scope)).toBe(5)
      })

      it('should evaluate string expressions', () => {
        const scope: ExpressionScope = { name: 'John' }
        expect(compile('{{name}}', scope)).toBe('John')
        expect(compile('{{name + " Doe"}}', scope)).toBe('John Doe')
      })

      it('should evaluate boolean expressions', () => {
        const scope: ExpressionScope = { flag: true }
        expect(compile('{{flag}}', scope)).toBe(true)
        expect(compile('{{!flag}}', scope)).toBe(false)
        expect(compile('{{flag && true}}', scope)).toBe(true)
      })

      it('should evaluate ternary expressions', () => {
        const scope: ExpressionScope = { value: 10 }
        expect(compile('{{value > 5 ? "big" : "small"}}', scope)).toBe('big')
        expect(compile('{{value < 5 ? "big" : "small"}}', scope)).toBe('small')
      })
    })

    describe('scope variables', () => {
      it('should access $self in scope', () => {
        const scope: ExpressionScope = {
          $self: { value: 42, name: 'test' },
        }
        expect(compile('{{$self.value}}', scope)).toBe(42)
        expect(compile('{{$self.name}}', scope)).toBe('test')
        expect(compile('{{$self.value * 2}}', scope)).toBe(84)
      })

      it('should access $deps in scope', () => {
        const scope: ExpressionScope = {
          $deps: [10, 20, 30],
        }
        expect(compile('{{$deps[0]}}', scope)).toBe(10)
        expect(compile('{{$deps[1]}}', scope)).toBe(20)
        expect(compile('{{$deps[0] + $deps[1]}}', scope)).toBe(30)
      })

      it('should access $form in scope', () => {
        const scope: ExpressionScope = {
          $form: { isValid: true, isDirty: false },
        }
        expect(compile('{{$form.isValid}}', scope)).toBe(true)
        expect(compile('{{$form.isDirty}}', scope)).toBe(false)
      })

      it('should access $values in scope', () => {
        const scope: ExpressionScope = {
          $values: { firstName: 'John', lastName: 'Doe' },
        }
        expect(compile('{{$values.firstName}}', scope)).toBe('John')
        expect(compile('{{$values.lastName}}', scope)).toBe('Doe')
        expect(compile('{{$values.firstName + " " + $values.lastName}}', scope)).toBe('John Doe')
      })

      it('should access all scope variables together', () => {
        const scope: ExpressionScope = {
          $self: { value: 10 },
          $deps: [5],
          $form: { mode: 'edit' },
          $values: { other: 3 },
        }
        expect(compile('{{$self.value + $deps[0] + $values.other}}', scope)).toBe(18)
      })
    })

    describe('non-expression handling', () => {
      it('should return original string for non-expressions', () => {
        const scope: ExpressionScope = {}
        expect(compile('plain text', scope)).toBe('plain text')
        expect(compile('hello world', scope)).toBe('hello world')
        expect(compile('123', scope)).toBe('123')
      })

      it('should return original string for partial expressions', () => {
        const scope: ExpressionScope = { value: 10 }
        expect(compile('value is {{value}}', scope)).toBe('value is {{value}}')
      })
    })

    describe('caching', () => {
      it('should cache compiled expressions', () => {
        const scope: ExpressionScope = { value: 10 }
        
        expect(getCacheSize()).toBe(0)
        
        compile('{{value + 1}}', scope)
        expect(getCacheSize()).toBe(1)
        
        compile('{{value + 1}}', scope)
        expect(getCacheSize()).toBe(1)
        
        compile('{{value + 2}}', scope)
        expect(getCacheSize()).toBe(2)
      })

      it('should use cached evaluator', () => {
        const scope: ExpressionScope = { value: 10 }
        
        compile('{{value}}', scope)
        compile('{{value}}', { value: 20 })
        
        expect(getCacheSize()).toBe(1)
      })
    })

    describe('error handling', () => {
      it('should return undefined for evaluation errors', () => {
        const scope: ExpressionScope = {}
        const result = compile('{{nonexistent.property}}', scope)
        expect(result).toBeUndefined()
      })

      it('should log warning for evaluation errors when not silent', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const scope: ExpressionScope = {}
        
        compile('{{nonexistent.property}}', scope)
        
        expect(warnSpy).toHaveBeenCalled()
        warnSpy.mockRestore()
      })

      it('should suppress warnings in silent mode', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const scope: ExpressionScope = {}
        
        compile('{{nonexistent.property}}', scope, { silent: true })
        
        expect(warnSpy).not.toHaveBeenCalled()
        warnSpy.mockRestore()
      })

      it('should handle syntax errors in expressions', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const scope: ExpressionScope = {}
        
        const result = compile('{{invalid syntax here!}}', scope)
        expect(result).toBeUndefined()
        
        errorSpy.mockRestore()
      })

      it('should suppress syntax error logs in silent mode', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const scope: ExpressionScope = {}
        
        compile('{{invalid syntax here!}}', scope, { silent: true })
        
        expect(errorSpy).not.toHaveBeenCalled()
        errorSpy.mockRestore()
      })
    })
  })

  describe('clearCache', () => {
    it('should clear all cached evaluators', () => {
      const scope: ExpressionScope = { value: 10 }
      
      compile('{{value}}', scope)
      compile('{{value + 1}}', scope)
      expect(getCacheSize()).toBe(2)
      
      clearCache()
      expect(getCacheSize()).toBe(0)
    })
  })

  describe('getCacheSize', () => {
    it('should return 0 when cache is empty', () => {
      expect(getCacheSize()).toBe(0)
    })

    it('should return correct count of cached items', () => {
      const scope: ExpressionScope = { value: 10 }
      
      compile('{{value}}', scope)
      expect(getCacheSize()).toBe(1)
      
      compile('{{value + 1}}', scope)
      expect(getCacheSize()).toBe(2)
      
      compile('{{value}}', scope)
      expect(getCacheSize()).toBe(2)
    })
  })

  describe('shallowCompile', () => {
    it('should compile string expressions', () => {
      const scope: ExpressionScope = { $self: { name: 'John' } }
      expect(shallowCompile('{{$self.name}}', scope)).toBe('John')
    })

    it('should return non-expression strings as-is', () => {
      const scope: ExpressionScope = {}
      expect(shallowCompile('plain text', scope)).toBe('plain text')
    })

    it('should process arrays', () => {
      const scope: ExpressionScope = { value: 10 }
      const input = ['{{$self.value}}', 'plain', '{{$self.value + 1}}']
      scope.$self = { value: 10 }
      
      expect(shallowCompile(input, scope)).toEqual([10, 'plain', 11])
    })

    it('should process nested objects', () => {
      const scope: ExpressionScope = { $self: { name: 'John', age: 30 } }
      const input = {
        label: '{{$self.name}}',
        value: 123,
        nested: {
          age: '{{$self.age}}',
          static: 'text',
        },
      }
      
      expect(shallowCompile(input, scope)).toEqual({
        label: 'John',
        value: 123,
        nested: {
          age: 30,
          static: 'text',
        },
      })
    })

    it('should process arrays of objects', () => {
      const scope: ExpressionScope = { $self: { active: true } }
      const input = [
        { label: '{{$self.active}}', value: 1 },
        { label: 'static', value: 2 },
      ]
      
      expect(shallowCompile(input, scope)).toEqual([
        { label: true, value: 1 },
        { label: 'static', value: 2 },
      ])
    })

    it('should return primitives as-is', () => {
      const scope: ExpressionScope = {}
      expect(shallowCompile(123, scope)).toBe(123)
      expect(shallowCompile(true, scope)).toBe(true)
      expect(shallowCompile(null, scope)).toBe(null)
      expect(shallowCompile(undefined, scope)).toBe(undefined)
    })

    it('should pass options to compile', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const scope: ExpressionScope = {}
      
      shallowCompile({ label: '{{nonexistent.prop}}' }, scope, { silent: true })
      
      expect(warnSpy).not.toHaveBeenCalled()
      warnSpy.mockRestore()
    })
  })
})
