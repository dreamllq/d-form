import { describe, it, expect, beforeEach, vi } from 'vitest'
import { z } from 'zod'
import type { ValidationRule, ValidationResult } from '@d-form/shared'

import { createForm } from '../models/form'
import { validateField, validateForm, createValidator } from '../validation'

describe('Validation', () => {
  describe('sync validation', () => {
    it('should validate required field - fail when empty', () => {
      const form = createForm()
      const field = form.registerField('name', { 
        type: 'string',
        validation: { rules: [{ type: 'required' }] }
      })
      const result = field.validate()
      expect(result.valid).toBe(false)
      expect(field.getError()).toBe('name is required')
    })

    it('should validate required field - pass when has value', () => {
      const form = createForm()
      const field = form.registerField('name', { 
        type: 'string',
        validation: { rules: [{ type: 'required' }] }
      })
      field.setValue('valid')
      const result = field.validate()
      expect(result.valid).toBe(true)
      expect(field.getError()).toBeUndefined()
    })

    it('should validate required field with zero value', () => {
      const form = createForm()
      const field = form.registerField('count', { 
        type: 'number',
        validation: { rules: [{ type: 'required' }] }
      })
      field.setValue(0)
      const result = field.validate()
      expect(result.valid).toBe(true)
    })

    it('should validate required field with false value', () => {
      const form = createForm()
      const field = form.registerField('agree', { 
        type: 'boolean',
        validation: { rules: [{ type: 'required' }] }
      })
      field.setValue(false)
      const result = field.validate()
      expect(result.valid).toBe(true)
    })

    it('should validate min value', () => {
      const form = createForm()
      const field = form.registerField('age', { 
        type: 'number',
        validation: { rules: [{ type: 'min', value: 18 }] }
      })
      
      field.setValue(10)
      let result = field.validate()
      expect(result.valid).toBe(false)
      
      field.setValue(18)
      result = field.validate()
      expect(result.valid).toBe(true)
      
      field.setValue(25)
      result = field.validate()
      expect(result.valid).toBe(true)
    })

    it('should validate max value', () => {
      const form = createForm()
      const field = form.registerField('age', { 
        type: 'number',
        validation: { rules: [{ type: 'max', value: 100 }] }
      })
      
      field.setValue(150)
      let result = field.validate()
      expect(result.valid).toBe(false)
      
      field.setValue(100)
      result = field.validate()
      expect(result.valid).toBe(true)
      
      field.setValue(50)
      result = field.validate()
      expect(result.valid).toBe(true)
    })

    it('should validate min length', () => {
      const form = createForm()
      const field = form.registerField('name', { 
        type: 'string',
        validation: { rules: [{ type: 'minLength', value: 3 }] }
      })
      
      field.setValue('ab')
      let result = field.validate()
      expect(result.valid).toBe(false)
      
      field.setValue('abc')
      result = field.validate()
      expect(result.valid).toBe(true)
    })

    it('should validate max length', () => {
      const form = createForm()
      const field = form.registerField('name', { 
        type: 'string',
        validation: { rules: [{ type: 'maxLength', value: 10 }] }
      })
      
      field.setValue('this is too long')
      let result = field.validate()
      expect(result.valid).toBe(false)
      
      field.setValue('short')
      result = field.validate()
      expect(result.valid).toBe(true)
    })

    it('should validate pattern with regex', () => {
      const form = createForm()
      const field = form.registerField('email', { 
        type: 'string',
        validation: { 
          rules: [{ 
            type: 'pattern', 
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
          }] 
        }
      })
      
      field.setValue('invalid')
      let result = field.validate()
      expect(result.valid).toBe(false)
      
      field.setValue('valid@example.com')
      result = field.validate()
      expect(result.valid).toBe(true)
    })

    it('should use custom error message', () => {
      const form = createForm()
      const field = form.registerField('name', { 
        type: 'string',
        validation: { 
          rules: [{ 
            type: 'required', 
            message: 'Name is mandatory' 
          }] 
        }
      })
      field.validate()
      expect(field.getError()).toBe('Name is mandatory')
    })

    it('should validate multiple rules', () => {
      const form = createForm()
      const field = form.registerField('password', { 
        type: 'string',
        validation: { 
          rules: [
            { type: 'required' },
            { type: 'minLength', value: 8 },
            { type: 'maxLength', value: 32 }
          ] 
        }
      })
      
      field.setValue('')
      let result = field.validate()
      expect(result.valid).toBe(false)
      
      field.setValue('short')
      result = field.validate()
      expect(result.valid).toBe(false)
      
      field.setValue('this password is way too long and exceeds the maximum limit')
      result = field.validate()
      expect(result.valid).toBe(false)
      
      field.setValue('validPassword123')
      result = field.validate()
      expect(result.valid).toBe(true)
    })

    it('should stop at first failure if configured', () => {
      const form = createForm()
      const field = form.registerField('name', { 
        type: 'string',
        validation: { 
          rules: [
            { type: 'required' },
            { type: 'minLength', value: 5 }
          ]
        }
      })
      
      field.setValue('ab')
      const result = field.validate()
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBe(1)
    })
  })

  describe('async validation', () => {
    it('should support async custom validator - pass', async () => {
      const form = createForm()
      const field = form.registerField('username', { 
        type: 'string',
        validation: { 
          rules: [{ 
            type: 'custom', 
            validator: async (value: string) => {
              await new Promise(r => setTimeout(r, 10))
              return value !== 'taken'
            },
            message: 'Username is already taken'
          }] 
        }
      })
      
      field.setValue('available')
      const result = await field.validate()
      expect(result.valid).toBe(true)
    })

    it('should support async custom validator - fail', async () => {
      const form = createForm()
      const field = form.registerField('username', { 
        type: 'string',
        validation: { 
          rules: [{ 
            type: 'custom', 
            validator: async (value: string) => {
              await new Promise(r => setTimeout(r, 10))
              return value !== 'taken'
            },
            message: 'Username is already taken'
          }] 
        }
      })
      
      field.setValue('taken')
      const result = await field.validate()
      expect(result.valid).toBe(false)
      expect(field.getError()).toBe('Username is already taken')
    })

    it('should handle async validator that throws', async () => {
      const form = createForm()
      const field = form.registerField('name', { 
        type: 'string',
        validation: { 
          rules: [{ 
            type: 'custom', 
            validator: async () => {
              throw new Error('Validation error')
            },
            message: 'Custom validation failed'
          }] 
        }
      })
      
      field.setValue('test')
      const result = await field.validate()
      expect(result.valid).toBe(false)
    })

    it('should track validating state during async validation', async () => {
      const form = createForm()
      const field = form.registerField('name', { 
        type: 'string',
        validation: { 
          rules: [{ 
            type: 'custom', 
            validator: async () => {
              await new Promise(r => setTimeout(r, 50))
              return true
            }
          }] 
        }
      })
      
      expect(field.getState().validating).toBe(false)
      const promise = field.validate()
      expect(field.getState().validating).toBe(true)
      await promise
      expect(field.getState().validating).toBe(false)
    })

    it('should support sync custom validator function', () => {
      const form = createForm()
      const field = form.registerField('name', { 
        type: 'string',
        validation: { 
          rules: [{ 
            type: 'custom', 
            validator: (value: string) => value.length >= 3,
            message: 'Must be at least 3 characters'
          }] 
        }
      })
      
      field.setValue('ab')
      let result = field.validate()
      expect(result.valid).toBe(false)
      
      field.setValue('abc')
      result = field.validate()
      expect(result.valid).toBe(true)
    })
  })

  describe('validation result aggregation', () => {
    it('should aggregate errors from multiple fields', async () => {
      const form = createForm()
      form.registerField('name', { 
        type: 'string', 
        validation: { rules: [{ type: 'required' }] } 
      })
      form.registerField('email', { 
        type: 'string', 
        validation: { rules: [{ type: 'required' }] } 
      })
      
      const result = await form.validate()
      expect(result.valid).toBe(false)
      expect(result.fields.name.valid).toBe(false)
      expect(result.fields.email.valid).toBe(false)
      expect(result.errors.length).toBe(2)
    })

    it('should return isValid state', async () => {
      const form = createForm()
      const field = form.registerField('name', { 
        type: 'string',
        validation: { rules: [{ type: 'required' }] }
      })
      await form.validate()
      expect(form.getState().isValid).toBe(false)
      
      field.setValue('valid')
      await form.validate()
      expect(form.getState().isValid).toBe(true)
    })

    it('should only validate visible fields if configured', async () => {
      const form = createForm()
      form.registerField('name', { 
        type: 'string',
        visible: true,
        validation: { 
          rules: [{ type: 'required' }],
          validateVisibleOnly: true
        } 
      })
      form.registerField('hidden', { 
        type: 'string',
        visible: false,
        validation: { 
          rules: [{ type: 'required' }],
          validateVisibleOnly: true
        } 
      })
      
      const result = await form.validate()
      expect(result.valid).toBe(false)
      expect(result.fields.name).toBeDefined()
      expect(result.fields.hidden).toBeUndefined()
    })

    it('should collect all error messages', async () => {
      const form = createForm()
      form.registerField('name', { 
        type: 'string', 
        validation: { 
          rules: [
            { type: 'required', message: 'Name required' }
          ] 
        } 
      })
      form.registerField('email', { 
        type: 'string', 
        validation: { 
          rules: [
            { type: 'required', message: 'Email required' }
          ] 
        } 
      })
      
      const result = await form.validate()
      expect(result.errors).toContain('Name required')
      expect(result.errors).toContain('Email required')
    })
  })

  describe('Zod integration', () => {
    it('should validate with Zod schema - valid data', async () => {
      const schema = z.object({
        name: z.string().min(3),
        email: z.string().email()
      })
      const form = createForm({ zodSchema: schema })
      form.registerField('name', { type: 'string' })
      form.registerField('email', { type: 'string' })
      
      form.setValues({ name: 'John', email: 'john@example.com' })
      const result = await form.validate()
      expect(result.valid).toBe(true)
    })

    it('should validate with Zod schema - invalid data', async () => {
      const schema = z.object({
        name: z.string().min(3),
        email: z.string().email()
      })
      const form = createForm({ zodSchema: schema })
      form.registerField('name', { type: 'string' })
      form.registerField('email', { type: 'string' })
      
      form.setValues({ name: 'ab', email: 'invalid' })
      const result = await form.validate()
      expect(result.valid).toBe(false)
    })

    it('should extract field errors from Zod validation', async () => {
      const schema = z.object({
        name: z.string().min(3, 'Name must be at least 3 characters'),
        email: z.string().email('Invalid email format')
      })
      const form = createForm({ zodSchema: schema })
      form.registerField('name', { type: 'string' })
      form.registerField('email', { type: 'string' })
      
      form.setValues({ name: 'ab', email: 'invalid' })
      const result = await form.validate()
      
      expect(result.fields.name.valid).toBe(false)
      expect(result.fields.email.valid).toBe(false)
      expect(result.fields.name.errors).toContain('Name must be at least 3 characters')
      expect(result.fields.email.errors).toContain('Invalid email format')
    })

    it('should validate single field with Zod', async () => {
      const schema = z.object({
        age: z.number().min(18, 'Must be 18 or older')
      })
      const form = createForm({ zodSchema: schema })
      form.registerField('age', { type: 'number' })
      
      form.setFieldValue('age', 15)
      const result = await form.validateField('age')
      expect(result.valid).toBe(false)
      
      form.setFieldValue('age', 25)
      const result2 = await form.validateField('age')
      expect(result2.valid).toBe(true)
    })

    it('should handle nested Zod schemas', async () => {
      const schema = z.object({
        user: z.object({
          name: z.string().min(1),
          email: z.string().email()
        })
      })
      const form = createForm({ zodSchema: schema })
      form.registerField('user.name', { type: 'string' })
      form.registerField('user.email', { type: 'string' })
      
      form.setValues({ user: { name: '', email: 'invalid' } })
      const result = await form.validate()
      expect(result.valid).toBe(false)
    })

    it('should handle Zod optional fields', async () => {
      const schema = z.object({
        name: z.string(),
        nickname: z.string().optional()
      })
      const form = createForm({ zodSchema: schema })
      form.registerField('name', { type: 'string' })
      form.registerField('nickname', { type: 'string' })
      
      form.setValues({ name: 'John' })
      const result = await form.validate()
      expect(result.valid).toBe(true)
    })

    it('should handle Zod transforms', async () => {
      const schema = z.object({
        age: z.string().transform(val => parseInt(val, 10))
      })
      const form = createForm({ zodSchema: schema })
      form.registerField('age', { type: 'string' })
      
      form.setValues({ age: '25' })
      const result = await form.validate()
      expect(result.valid).toBe(true)
    })
  })

  describe('validation triggers', () => {
    it('should validate on blur when configured', () => {
      const form = createForm({ validateOnBlur: true })
      const field = form.registerField('name', { 
        type: 'string',
        validation: { 
          rules: [{ type: 'required' }],
          trigger: 'blur'
        } 
      })
      
      expect(field.getError()).toBeUndefined()
      field.setTouched(true)
      expect(field.getError()).toBeDefined()
    })

    it('should validate on change when configured', () => {
      const form = createForm({ validateOnChange: true })
      const field = form.registerField('name', { 
        type: 'string',
        validation: { 
          rules: [{ type: 'minLength', value: 3 }],
          trigger: 'change'
        } 
      })
      
      field.setValue('ab')
      expect(field.getError()).toBeDefined()
      
      field.setValue('abc')
      expect(field.getError()).toBeUndefined()
    })

    it('should validate on submit by default', async () => {
      const form = createForm()
      form.registerField('name', { 
        type: 'string',
        validation: { rules: [{ type: 'required' }] } 
      })
      
      await form.submit()
      expect(form.getState().isValid).toBe(false)
    })
  })

  describe('createValidator utility', () => {
    it('should create validator from rules', () => {
      const rules: ValidationRule[] = [
        { type: 'required' },
        { type: 'minLength', value: 3 }
      ]
      const validator = createValidator(rules)
      
      let result = validator('')
      expect(result.valid).toBe(false)
      
      result = validator('ab')
      expect(result.valid).toBe(false)
      
      result = validator('valid')
      expect(result.valid).toBe(true)
    })

    it('should support custom validator in createValidator', async () => {
      const rules: ValidationRule[] = [
        { 
          type: 'custom',
          validator: (value: string) => value.startsWith('test'),
          message: 'Must start with test'
        }
      ]
      const validator = createValidator(rules)
      
      let result = validator('invalid')
      expect(result.valid).toBe(false)
      
      result = validator('test-valid')
      expect(result.valid).toBe(true)
    })
  })
})
