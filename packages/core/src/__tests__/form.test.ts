import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { FormSchema, FormState } from '@d-form/shared'

// These imports will fail - that's expected in TDD RED phase
import { createForm } from '../models/form'

describe('Form State Management', () => {
  describe('createForm', () => {
    it('should create a form with initial values', () => {
      const form = createForm({
        initialValues: { name: 'test', email: 'test@example.com' }
      })
      expect(form.getValues()).toEqual({ name: 'test', email: 'test@example.com' })
    })

    it('should create a form from schema', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Name' },
          email: { type: 'string', title: 'Email' }
        }
      }
      const form = createForm({ schema })
      expect(form.hasField('name')).toBe(true)
      expect(form.hasField('email')).toBe(true)
    })

    it('should have empty values when no initial values provided', () => {
      const form = createForm()
      expect(form.getValues()).toEqual({})
    })

    it('should merge initial values with schema defaults', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'default name' },
          email: { type: 'string' }
        }
      }
      const form = createForm({
        schema,
        initialValues: { email: 'test@example.com' }
      })
      expect(form.getValues()).toEqual({
        name: 'default name',
        email: 'test@example.com'
      })
    })
  })

  describe('getValues / setValues', () => {
    it('should set and get field values', () => {
      const form = createForm()
      form.setFieldValue('name', 'John')
      expect(form.getFieldValue('name')).toBe('John')
    })

    it('should set multiple values at once', () => {
      const form = createForm()
      form.setValues({ name: 'John', email: 'john@example.com' })
      expect(form.getValues()).toEqual({ name: 'John', email: 'john@example.com' })
    })

    it('should get nested values using dot notation', () => {
      const form = createForm()
      form.setFieldValue('user.name', 'John')
      expect(form.getFieldValue('user.name')).toBe('John')
    })

    it('should set nested values using dot notation', () => {
      const form = createForm()
      form.setFieldValue('user.address.city', 'New York')
      expect(form.getFieldValue('user.address.city')).toBe('New York')
      expect(form.getFieldValue('user')).toEqual({ address: { city: 'New York' } })
    })

    it('should return undefined for non-existent field', () => {
      const form = createForm()
      expect(form.getFieldValue('nonexistent')).toBeUndefined()
    })
  })

  describe('form submission', () => {
    it('should track submitting state', () => {
      const form = createForm()
      expect(form.getState().submitting).toBe(false)
      
      const submitPromise = form.submit(async () => {
        await new Promise(r => setTimeout(r, 100))
      })
      expect(form.getState().submitting).toBe(true)
      
      return submitPromise.then(() => {
        expect(form.getState().submitting).toBe(false)
      })
    })

    it('should call onSubmit callback', async () => {
      let called = false
      let submittedValues: any = null
      const form = createForm({
        initialValues: { name: 'test' },
        onSubmit: (values) => {
          called = true
          submittedValues = values
        }
      })
      await form.submit()
      expect(called).toBe(true)
      expect(submittedValues).toEqual({ name: 'test' })
    })

    it('should increment submit count on each submission', async () => {
      const form = createForm()
      expect(form.getState().submitCount).toBe(0)
      
      await form.submit()
      expect(form.getState().submitCount).toBe(1)
      
      await form.submit()
      expect(form.getState().submitCount).toBe(2)
    })

    it('should set submitted flag after first submission', async () => {
      const form = createForm()
      expect(form.getState().submitted).toBe(false)
      
      await form.submit()
      expect(form.getState().submitted).toBe(true)
    })

    it('should not submit if validation fails', async () => {
      let submitCalled = false
      const form = createForm({
        onSubmit: () => { submitCalled = true }
      })
      
      // Register a required field
      form.registerField('name', { 
        type: 'string',
        validation: { rules: [{ type: 'required' }] }
      })
      
      // Try to submit without filling required field
      await form.submit()
      expect(submitCalled).toBe(false)
      expect(form.getState().isValid).toBe(false)
    })
  })

  describe('form reset', () => {
    it('should reset form to initial values', () => {
      const form = createForm({ initialValues: { name: 'initial' } })
      form.setFieldValue('name', 'changed')
      form.reset()
      expect(form.getFieldValue('name')).toBe('initial')
    })

    it('should clear errors on reset', () => {
      const form = createForm()
      form.registerField('name', { type: 'string' })
      form.setFieldError('name', 'Required')
      form.reset()
      expect(form.getFieldError('name')).toBeUndefined()
    })

    it('should clear touched state on reset', () => {
      const form = createForm()
      form.registerField('name', { type: 'string' })
      form.setFieldTouched('name', true)
      form.reset()
      expect(form.getFieldState('name')?.touched).toBe(false)
    })

    it('should reset all fields to their initial states', () => {
      const form = createForm({ 
        initialValues: { name: 'John', email: 'john@example.com' }
      })
      form.registerField('name', { type: 'string' })
      form.registerField('email', { type: 'string' })
      
      form.setFieldValue('name', 'Jane')
      form.setFieldValue('email', 'jane@example.com')
      form.setFieldTouched('name', true)
      
      form.reset()
      
      expect(form.getFieldValue('name')).toBe('John')
      expect(form.getFieldValue('email')).toBe('john@example.com')
      expect(form.getFieldState('name')?.touched).toBe(false)
    })

    it('should reset dirty state to false', () => {
      const form = createForm({ initialValues: { name: 'initial' } })
      form.registerField('name', { type: 'string' })
      form.setFieldValue('name', 'changed')
      expect(form.getState().dirty).toBe(true)
      
      form.reset()
      expect(form.getState().dirty).toBe(false)
    })
  })

  describe('field registration', () => {
    it('should register a field', () => {
      const form = createForm()
      form.registerField('username', { type: 'string' })
      expect(form.hasField('username')).toBe(true)
    })

    it('should unregister a field', () => {
      const form = createForm()
      form.registerField('username', { type: 'string' })
      form.unregisterField('username')
      expect(form.hasField('username')).toBe(false)
    })

    it('should initialize field with default value from schema', () => {
      const form = createForm()
      form.registerField('name', { type: 'string', default: 'default value' })
      expect(form.getFieldValue('name')).toBe('default value')
    })

    it('should get all registered field names', () => {
      const form = createForm()
      form.registerField('name', { type: 'string' })
      form.registerField('email', { type: 'string' })
      form.registerField('age', { type: 'number' })
      
      const fieldNames = form.getFieldNames()
      expect(fieldNames).toContain('name')
      expect(fieldNames).toContain('email')
      expect(fieldNames).toContain('age')
      expect(fieldNames.length).toBe(3)
    })
  })

  describe('form state', () => {
    it('should track dirty state', () => {
      const form = createForm({ initialValues: { name: 'initial' } })
      expect(form.getState().dirty).toBe(false)
      
      form.registerField('name', { type: 'string' })
      form.setFieldValue('name', 'changed')
      expect(form.getState().dirty).toBe(true)
    })

    it('should get field state', () => {
      const form = createForm()
      form.registerField('name', { type: 'string' })
      form.setFieldValue('name', 'test')
      form.setFieldTouched('name', true)
      
      const state = form.getFieldState('name')
      expect(state?.value).toBe('test')
      expect(state?.touched).toBe(true)
    })

    it('should set field state', () => {
      const form = createForm()
      form.registerField('name', { type: 'string' })
      
      form.setFieldState('name', {
        value: 'new value',
        touched: true,
        dirty: true
      })
      
      expect(form.getFieldValue('name')).toBe('new value')
      expect(form.getFieldState('name')?.touched).toBe(true)
      expect(form.getFieldState('name')?.dirty).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should set and get field error', () => {
      const form = createForm()
      form.registerField('name', { type: 'string' })
      form.setFieldError('name', 'This field is required')
      expect(form.getFieldError('name')).toBe('This field is required')
    })

    it('should get all errors', () => {
      const form = createForm()
      form.registerField('name', { type: 'string' })
      form.registerField('email', { type: 'string' })
      
      form.setFieldError('name', 'Name is required')
      form.setFieldError('email', 'Invalid email')
      
      const errors = form.getErrors()
      expect(errors.name).toBe('Name is required')
      expect(errors.email).toBe('Invalid email')
    })

    it('should clear all errors', () => {
      const form = createForm()
      form.registerField('name', { type: 'string' })
      form.registerField('email', { type: 'string' })
      
      form.setFieldError('name', 'Required')
      form.setFieldError('email', 'Invalid')
      
      form.clearErrors()
      
      expect(form.getFieldError('name')).toBeUndefined()
      expect(form.getFieldError('email')).toBeUndefined()
    })
  })

  describe('callbacks', () => {
    it('should call onValuesChange when values change', () => {
      const onValuesChange = vi.fn()
      const form = createForm({ onValuesChange })
      
      form.registerField('name', { type: 'string' })
      form.setFieldValue('name', 'test')
      
      expect(onValuesChange).toHaveBeenCalledWith(
        { name: 'test' },
        'name'
      )
    })

    it('should not call onValuesChange when value is same', () => {
      const onValuesChange = vi.fn()
      const form = createForm({ 
        initialValues: { name: 'test' },
        onValuesChange 
      })
      
      form.registerField('name', { type: 'string' })
      form.setFieldValue('name', 'test')
      
      expect(onValuesChange).not.toHaveBeenCalled()
    })
  })
})
