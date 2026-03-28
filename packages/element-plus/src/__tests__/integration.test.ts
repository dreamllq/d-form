import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createForm, createReaction } from '@d-form/core'
import type { FormSchema } from '@d-form/core'
import { hasComponent, clearComponents } from '@d-form/vue'
import { registerElementPlusComponents } from '../index'

describe('Element Plus Integration Tests', () => {
  beforeEach(() => {
    clearComponents()
  })

  describe('Adapter Registration', () => {
    it('should register all Element Plus component adapters without throwing', () => {
      expect(() => registerElementPlusComponents()).not.toThrow()
    })

    it('should register all 8 field type adapters', () => {
      registerElementPlusComponents()

      const componentNames = [
        'input',
        'select',
        'date-picker',
        'checkbox',
        'radio',
        'switch',
        'input-number',
        'textarea',
      ]

      for (const name of componentNames) {
        expect(hasComponent(name)).toBe(true)
      }
    })
  })

  describe('Form Creation with Schema', () => {
    it('should create form with schema and register fields', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', title: 'Name' },
          age: { type: 'number', title: 'Age' },
          active: { type: 'boolean', title: 'Active' },
        },
      }

      const form = createForm({ schema })

      expect(form.hasField('name')).toBe(true)
      expect(form.hasField('age')).toBe(true)
      expect(form.hasField('active')).toBe(true)
    })

    it('should create form with initialValues', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
      }

      const form = createForm({
        schema,
        initialValues: { name: 'John', email: 'john@test.com' },
      })

      expect(form.getFieldValue('name')).toBe('John')
      expect(form.getFieldValue('email')).toBe('john@test.com')
    })
  })

  describe('Field Values', () => {
    it('should set and get field values', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            count: { type: 'number' },
          },
        },
      })

      form.setFieldValue('username', 'testuser')
      form.setFieldValue('count', 42)

      expect(form.getFieldValue('username')).toBe('testuser')
      expect(form.getFieldValue('count')).toBe(42)
    })

    it('should return all values via getValues', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            a: { type: 'string' },
            b: { type: 'number' },
          },
        },
        initialValues: { a: 'hello', b: 10 },
      })

      const values = form.getValues()
      expect(values).toEqual({ a: 'hello', b: 10 })
    })
  })

  describe('Field Validation with Errors', () => {
    it('should validate required fields and report errors', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              validation: { rules: [{ type: 'required', message: 'Name is required' }] },
            },
          },
        },
      })

      const result = await form.validate()
      expect(result.valid).toBe(false)
      expect((result.fields as Record<string, any>).name.valid).toBe(false)
      expect(result.fields.name.errors).toContain('Name is required')
    })

    it('should validate minLength rule', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            password: {
              type: 'string',
              validation: { rules: [{ type: 'minLength', value: 8, message: 'Too short' }] },
            },
          },
        },
      })

      form.setFieldValue('password', 'abc')
      const result = await form.validate()
      expect(result.valid).toBe(false)
      expect(result.fields.password.errors).toContain('Too short')
    })

    it('should clear errors when field becomes valid', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              validation: {
                rules: [
                  { type: 'required', message: 'Required' },
                  {
                    type: 'pattern',
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email',
                  },
                ],
              },
            },
          },
        },
      })

      await form.validate()
      expect(form.getFieldError('email')).toBeDefined()

      form.setFieldValue('email', 'valid@test.com')
      await form.validate()
      expect(form.getFieldError('email')).toBeUndefined()
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit with form values when validation passes', async () => {
      const onSubmit = vi.fn()
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
        initialValues: { name: 'John' },
        onSubmit,
      })

      await form.submit()
      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit).toHaveBeenCalledWith({ name: 'John' })
      expect(form.getState().submitCount).toBe(1)
      expect(form.getState().submitted).toBe(true)
    })

    it('should not call onSubmit when validation fails', async () => {
      const onSubmit = vi.fn()
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            required: {
              type: 'string',
              validation: { rules: [{ type: 'required' }] },
            },
          },
        },
        onSubmit,
      })

      await form.submit()
      expect(onSubmit).not.toHaveBeenCalled()
      expect(form.getState().submitCount).toBe(0)
    })
  })

  describe('Field Reactions / Linkage', () => {
    it('should update target field when source field changes', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            source: { type: 'string' },
            target: { type: 'string' },
          },
        },
      })

      createReaction(form, 'source', {
        target: 'target',
        fulfill: {
          state: { value: '{{$self.value}}' },
        },
      })

      form.setFieldValue('source', 'Hello')
      expect(form.getFieldValue('target')).toBe('Hello')
    })

    it('should handle when/otherwise conditions', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            country: { type: 'string' },
            city: { type: 'string' },
          },
        },
      })

      createReaction(form, 'country', {
        target: 'city',
        when: '{{$self.value === "US"}}',
        fulfill: { state: { value: 'New York' } },
        otherwise: { state: { value: 'Other' } },
      })

      form.setFieldValue('country', 'US')
      expect(form.getFieldValue('city')).toBe('New York')

      form.setFieldValue('country', 'UK')
      expect(form.getFieldValue('city')).toBe('Other')
    })

    it('should handle reactions with dependencies', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            price: { type: 'number' },
            quantity: { type: 'number' },
            total: { type: 'number' },
          },
        },
      })

      createReaction(form, 'total', {
        dependencies: ['price', 'quantity'],
        fulfill: {
          state: { value: '{{($dependencies.price || 0) * ($dependencies.quantity || 0)}}' },
        },
      })

      form.setFieldValue('price', 10)
      form.setFieldValue('quantity', 5)
      expect(form.getFieldValue('total')).toBe(50)

      form.setFieldValue('price', 20)
      expect(form.getFieldValue('total')).toBe(100)
    })
  })

  describe('Form Reset', () => {
    it('should reset form to initial values', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
          },
        },
        initialValues: { name: 'John', email: 'john@test.com' },
      })

      form.setFieldValue('name', 'Jane')
      form.setFieldTouched('name', true)
      expect(form.getFieldValue('name')).toBe('Jane')

      form.reset()
      expect(form.getFieldValue('name')).toBe('John')
      expect(form.getFieldState('name')?.touched).toBe(false)
      expect(form.getFieldState('name')?.dirty).toBe(false)
      expect(form.getState().dirty).toBe(false)
    })

    it('should clear errors on reset', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              validation: { rules: [{ type: 'required' }] },
            },
          },
        },
      })

      await form.validate()
      expect(form.getFieldError('field')).toBeDefined()

      form.reset()
      expect(form.getFieldError('field')).toBeUndefined()
    })
  })

  describe('Dirty/Touched State Tracking', () => {
    it('should track dirty state when field value changes', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
        initialValues: { name: 'John' },
      })

      expect(form.getState().dirty).toBe(false)
      expect(form.getFieldState('name')?.dirty).toBe(false)

      form.setFieldValue('name', 'Jane')
      expect(form.getState().dirty).toBe(true)
      expect(form.getFieldState('name')?.dirty).toBe(true)
    })

    it('should track touched state when setFieldTouched is called', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            email: { type: 'string' },
          },
        },
      })

      expect(form.getFieldState('email')?.touched).toBe(false)

      form.setFieldTouched('email', true)
      expect(form.getFieldState('email')?.touched).toBe(true)
    })
  })

  describe('Multiple Field Validation', () => {
    it('should validate multiple fields and collect all errors', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              validation: { rules: [{ type: 'required', message: 'Name required' }] },
            },
            email: {
              type: 'string',
              validation: { rules: [{ type: 'required', message: 'Email required' }] },
            },
            age: {
              type: 'number',
              validation: { rules: [{ type: 'min', value: 18, message: 'Too young' }] },
            },
          },
        },
      })

      form.setFieldValue('age', 15)
      const result = await form.validate()

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBe(3)
      expect(result.errors).toContain('Name required')
      expect(result.errors).toContain('Email required')
      expect(result.errors).toContain('Too young')
    })

    it('should validate individual fields', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            field1: {
              type: 'string',
              validation: { rules: [{ type: 'required' }] },
            },
            field2: { type: 'string' },
          },
        },
      })

      const field1Result = await form.validateField('field1')
      expect(field1Result.valid).toBe(false)

      const field2Result = await form.validateField('field2')
      expect(field2Result.valid).toBe(true)
    })
  })

  describe('Computed Fields with Dependencies', () => {
    it('should compute total from price and quantity', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            price: { type: 'number' },
            quantity: { type: 'number' },
            total: { type: 'number' },
          },
        },
      })

      createReaction(form, 'total', {
        dependencies: ['price', 'quantity'],
        fulfill: {
          state: { value: '{{($dependencies.price || 0) * ($dependencies.quantity || 0)}}' },
        },
      })

      form.setFieldValue('price', 25)
      form.setFieldValue('quantity', 4)
      expect(form.getFieldValue('total')).toBe(100)

      form.setFieldValue('quantity', 2)
      expect(form.getFieldValue('total')).toBe(50)
    })

    it('should handle show/hide based on dependency values', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            hasDiscount: { type: 'boolean' },
            discountCode: { type: 'string' },
          },
        },
      })

      createReaction(form, 'hasDiscount', {
        target: 'discountCode',
        fulfill: {
          state: { visible: '{{$self.value === true}}' } as any,
        },
      })

      form.setFieldValue('hasDiscount', false)
      expect(form.getField('discountCode')?.getState().visible).toBe(false)

      form.setFieldValue('hasDiscount', true)
      expect(form.getField('discountCode')?.getState().visible).toBe(true)
    })
  })

  describe('All 8 Field Types via Schema', () => {
    it('should create form with all field types using Element Plus component names', () => {
      registerElementPlusComponents()

      const schema: FormSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', component: 'input', title: 'Name' },
          category: {
            type: 'string',
            component: 'select',
            title: 'Category',
            enum: [
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ],
          },
          birthday: { type: 'string', component: 'date-picker', title: 'Birthday' },
          agree: { type: 'boolean', component: 'checkbox', title: 'Agree' },
          gender: {
            type: 'string',
            component: 'radio',
            title: 'Gender',
            enum: [
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
            ],
          },
          enabled: { type: 'boolean', component: 'switch', title: 'Enabled' },
          count: { type: 'number', component: 'input-number', title: 'Count' },
          notes: { type: 'string', component: 'textarea', title: 'Notes' },
        },
      }

      const form = createForm({ schema })

      const fieldNames = form.getFieldNames()
      expect(fieldNames).toContain('name')
      expect(fieldNames).toContain('category')
      expect(fieldNames).toContain('birthday')
      expect(fieldNames).toContain('agree')
      expect(fieldNames).toContain('gender')
      expect(fieldNames).toContain('enabled')
      expect(fieldNames).toContain('count')
      expect(fieldNames).toContain('notes')
      expect(fieldNames.length).toBe(8)
    })

    it('should set and get values for all field types', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            input: { type: 'string' },
            select: { type: 'string' },
            datePicker: { type: 'string' },
            checkbox: { type: 'boolean' },
            radio: { type: 'string' },
            switch: { type: 'boolean' },
            number: { type: 'number' },
            textarea: { type: 'string' },
          },
        },
      })

      form.setFieldValue('input', 'text value')
      form.setFieldValue('select', 'option1')
      form.setFieldValue('datePicker', '2024-01-15')
      form.setFieldValue('checkbox', true)
      form.setFieldValue('radio', 'male')
      form.setFieldValue('switch', false)
      form.setFieldValue('number', 42)
      form.setFieldValue('textarea', 'long text here')

      expect(form.getFieldValue('input')).toBe('text value')
      expect(form.getFieldValue('select')).toBe('option1')
      expect(form.getFieldValue('datePicker')).toBe('2024-01-15')
      expect(form.getFieldValue('checkbox')).toBe(true)
      expect(form.getFieldValue('radio')).toBe('male')
      expect(form.getFieldValue('switch')).toBe(false)
      expect(form.getFieldValue('number')).toBe(42)
      expect(form.getFieldValue('textarea')).toBe('long text here')
    })
  })
})
