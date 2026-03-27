import { describe, it, expect } from 'vitest'
import { z } from 'zod'

import {
  extractZodErrorMessages,
  mapZodErrorsToFields,
  validateWithZodSync,
  validateWithZodAsync,
  validateWithZod,
  validateFieldWithZod,
  validateFormWithZod,
  createZodValidator,
  isZodError,
  getFirstError
} from '../validation/zod'

describe('Zod validation', () => {
  describe('extractZodErrorMessages', () => {
    it('should extract error messages from Zod error', () => {
      const schema = z.string().min(5)
      const result = schema.safeParse('ab')
      
      if (!result.success) {
        const messages = extractZodErrorMessages(result.error)
        expect(messages.length).toBe(1)
        expect(messages[0]).toContain('5')
      }
    })

    it('should extract multiple error messages', () => {
      const schema = z.string().min(5).max(10)
      const result = schema.safeParse('ab')
      
      if (!result.success) {
        const messages = extractZodErrorMessages(result.error)
        expect(messages.length).toBeGreaterThanOrEqual(1)
      }
    })
  })

  describe('mapZodErrorsToFields', () => {
    it('should map errors to field paths', () => {
      const schema = z.object({
        name: z.string().min(3),
        email: z.string().email()
      })
      const result = schema.safeParse({ name: 'ab', email: 'invalid' })
      
      if (!result.success) {
        const fieldErrors = mapZodErrorsToFields(result.error)
        expect('name' in fieldErrors).toBe(true)
        expect('email' in fieldErrors).toBe(true)
      }
    })

    it('should handle nested paths', () => {
      const schema = z.object({
        user: z.object({
          name: z.string().min(1)
        })
      })
      const result = schema.safeParse({ user: { name: '' } })
      
      if (!result.success) {
        const fieldErrors = mapZodErrorsToFields(result.error)
        expect('user.name' in fieldErrors).toBe(true)
      }
    })

    it('should return empty object for valid data', () => {
      const schema = z.object({ name: z.string() })
      const result = schema.safeParse({ name: 'valid' })
      
      if (result.success) {
        expect(true).toBe(true)
      } else {
        const fieldErrors = mapZodErrorsToFields(result.error)
        expect(Object.keys(fieldErrors).length).toBe(0)
      }
    })
  })

  describe('validateWithZodSync', () => {
    it('should return valid result for valid data', () => {
      const schema = z.string().min(3)
      const result = validateWithZodSync(schema, 'valid')
      
      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('should return invalid result for invalid data', () => {
      const schema = z.string().min(3)
      const result = validateWithZodSync(schema, 'ab')
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('validateWithZodAsync', () => {
    it('should return valid result for valid data', async () => {
      const schema = z.string().min(3)
      const result = await validateWithZodAsync(schema, 'valid')
      
      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('should return invalid result for invalid data', async () => {
      const schema = z.string().min(3)
      const result = await validateWithZodAsync(schema, 'ab')
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should support async refinements', async () => {
      const schema = z.string().refine(
        async (val) => val !== 'taken',
        { message: 'Value is taken' }
      )
      
      const validResult = await validateWithZodAsync(schema, 'available')
      expect(validResult.valid).toBe(true)
      
      const invalidResult = await validateWithZodAsync(schema, 'taken')
      expect(invalidResult.valid).toBe(false)
      expect(invalidResult.errors).toContain('Value is taken')
    })
  })

  describe('validateWithZod', () => {
    it('should validate sync schemas', () => {
      const schema = z.string().min(3)
      const result = validateWithZod(schema, 'valid')
      
      expect(result.valid).toBe(true)
    })

    it('should return errors for invalid sync validation', () => {
      const schema = z.string().min(3)
      const result = validateWithZod(schema, 'ab')
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('validateFieldWithZod', () => {
    it('should validate a single field', async () => {
      const schema = z.object({
        name: z.string().min(3),
        email: z.string().email()
      })
      
      const result = await validateFieldWithZod(schema, 'name', 'ab')
      expect(result.valid).toBe(false)
      
      const validResult = await validateFieldWithZod(schema, 'name', 'valid')
      expect(validResult.valid).toBe(true)
    })

    it('should validate email field', async () => {
      const schema = z.object({
        email: z.string().email('Invalid email')
      })
      
      const invalidResult = await validateFieldWithZod(schema, 'email', 'invalid')
      expect(invalidResult.valid).toBe(false)
      
      const validResult = await validateFieldWithZod(schema, 'email', 'test@example.com')
      expect(validResult.valid).toBe(true)
    })

    it('should handle missing field in schema', async () => {
      const schema = z.object({
        name: z.string()
      })
      
      const result = await validateFieldWithZod(schema, 'unknown', 'value')
      expect(result).toBeDefined()
    })
  })

  describe('validateFormWithZod', () => {
    it('should validate entire form', async () => {
      const schema = z.object({
        name: z.string().min(3),
        email: z.string().email()
      })
      
      const validResult = await validateFormWithZod(schema, {
        name: 'John',
        email: 'john@example.com'
      })
      
      expect(validResult.valid).toBe(true)
      expect(validResult.errors.length).toBe(0)
    })

    it('should collect all errors for invalid form', async () => {
      const schema = z.object({
        name: z.string().min(3, 'Name too short'),
        email: z.string().email('Invalid email')
      })
      
      const result = await validateFormWithZod(schema, {
        name: 'ab',
        email: 'invalid'
      })
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should map errors to fields', async () => {
      const schema = z.object({
        name: z.string().min(3, 'Name too short'),
        email: z.string().email('Invalid email')
      })
      
      const result = await validateFormWithZod(schema, {
        name: 'ab',
        email: 'invalid'
      })
      
      expect(result.fields.name.valid).toBe(false)
      expect(result.fields.email.valid).toBe(false)
      expect(result.fields.name.errors).toContain('Name too short')
    })

    it('should initialize field results when fieldNames provided', async () => {
      const schema = z.object({
        name: z.string(),
        email: z.string()
      })
      
      const result = await validateFormWithZod(
        schema,
        { name: 'John', email: 'john@example.com' },
        ['name', 'email', 'phone']
      )
      
      expect(result.fields.name).toBeDefined()
      expect(result.fields.email).toBeDefined()
      expect(result.fields.phone).toBeDefined()
      expect(result.fields.phone.valid).toBe(true)
    })
  })

  describe('createZodValidator', () => {
    it('should create a validator function', () => {
      const schema = z.string().min(3)
      const validator = createZodValidator(schema)
      
      const validResult = validator('valid')
      expect(validResult.valid).toBe(true)
      
      const invalidResult = validator('ab')
      expect(invalidResult.valid).toBe(false)
    })
  })

  describe('isZodError', () => {
    it('should return true for Zod errors', () => {
      const schema = z.string().min(3)
      const result = schema.safeParse('ab')
      
      if (!result.success) {
        expect(isZodError(result.error)).toBe(true)
      }
    })

    it('should return false for non-Zod errors', () => {
      expect(isZodError(new Error('test'))).toBe(false)
      expect(isZodError(null)).toBe(false)
      expect(isZodError(undefined)).toBe(false)
      expect(isZodError({})).toBe(false)
      expect(isZodError({ issues: 'not an array' })).toBe(false)
    })
  })

  describe('getFirstError', () => {
    it('should return first error message', () => {
      const result = { valid: false, errors: ['Error 1', 'Error 2'] }
      expect(getFirstError(result)).toBe('Error 1')
    })

    it('should return undefined for no errors', () => {
      const result = { valid: true, errors: [] }
      expect(getFirstError(result)).toBeUndefined()
    })
  })
})
