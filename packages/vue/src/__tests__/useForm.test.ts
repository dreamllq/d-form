import { describe, it, expect, vi } from 'vitest'
import { useForm } from '../composables/useForm'
import type { FormSchema } from '@d-form/core'

describe('useForm', () => {
  describe('initialization', () => {
    it('creates form with default options', () => {
      const { form, values, errors, touched, dirty, submitting, isValid } = useForm()

      expect(form).toBeDefined()
      expect(values).toEqual({})
      expect(errors).toEqual({})
      expect(touched).toEqual({})
      expect(dirty.value).toBe(false)
      expect(submitting.value).toBe(false)
      expect(isValid.value).toBe(true)
    })

    it('creates form with initial values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' }
      const { values } = useForm({ initialValues })

      expect(values).toEqual(initialValues)
    })

    it('creates form with schema', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'default-name' },
          email: { type: 'string' }
        }
      }
      const { values } = useForm(schema)

      expect(values.name).toBe('default-name')
      expect(values.email).toBeUndefined()
    })
  })

  describe('setFieldValue', () => {
    it('sets a field value', () => {
      const { values, setFieldValue } = useForm({ initialValues: { name: '' } })

      setFieldValue('name', 'John')

      expect(values.name).toBe('John')
    })

    it('updates dirty state when value changes', () => {
      const { dirty, setFieldValue, registerField } = useForm({ initialValues: { name: '' } })

      registerField('name', { type: 'string' })
      setFieldValue('name', 'John')

      expect(dirty.value).toBe(true)
    })
  })

  describe('setValues', () => {
    it('sets multiple values', () => {
      const { values, setValues } = useForm({ initialValues: { name: '', email: '' } })

      setValues({ name: 'John', email: 'john@example.com' })

      expect(values.name).toBe('John')
      expect(values.email).toBe('john@example.com')
    })
  })

  describe('validate', () => {
    it('validates form and returns result', async () => {
      const schema: FormSchema = {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            validation: {
              rules: [{ type: 'required', message: 'Name is required' }]
            }
          }
        }
      }
      const { validate, isValid, errors } = useForm({
        schema,
        initialValues: { name: '' }
      })

      const result = await validate()

      expect(result.valid).toBe(false)
      expect(isValid.value).toBe(false)
      expect(errors.name).toBe('Name is required')
    })

    it('returns valid result when no validation rules', async () => {
      const { validate, errors } = useForm({
        initialValues: { name: '' }
      })

      const result = await validate()

      expect(result.valid).toBe(true)
      expect(Object.keys(errors)).toHaveLength(0)
    })
  })

  describe('clearErrors', () => {
    it('clears all errors', async () => {
      const schema: FormSchema = {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            validation: {
              rules: [{ type: 'required' }]
            }
          }
        }
      }
      const { validate, clearErrors, isValid, errors } = useForm({
        schema,
        initialValues: { name: '' }
      })

      await validate()
      expect(errors.name).toBeDefined()

      clearErrors()
      expect(errors.name).toBeUndefined()
      expect(isValid.value).toBe(true)
    })
  })

  describe('getErrors', () => {
    it('returns all errors', async () => {
      const schema: FormSchema = {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            validation: {
              rules: [{ type: 'required', message: 'Name required' }]
            }
          },
          email: {
            type: 'string',
            validation: {
              rules: [{ type: 'required', message: 'Email required' }]
            }
          }
        }
      }
      const { validate, getErrors } = useForm({
        schema,
        initialValues: { name: '', email: '' }
      })

      await validate()
      const allErrors = getErrors()

      expect(Object.keys(allErrors)).toHaveLength(2)
      expect(allErrors.name).toBe('Name required')
      expect(allErrors.email).toBe('Email required')
    })
  })

  describe('getFieldValue', () => {
    it('gets field value', () => {
      const { getFieldValue } = useForm({ initialValues: { name: 'John' } })

      expect(getFieldValue('name')).toBe('John')
    })
  })

  describe('getFieldError', () => {
    it('returns undefined when no error', () => {
      const { getFieldError } = useForm({ initialValues: { name: '' } })

      expect(getFieldError('name')).toBeUndefined()
    })
  })

  describe('registerField', () => {
    it('registers a field', () => {
      const { form, registerField } = useForm()

      const field = registerField('name', { type: 'string' })

      expect(field).toBeDefined()
      expect(form.hasField('name')).toBe(true)
    })
  })

  describe('submit', () => {
    it('calls onSubmit callback', async () => {
      const onSubmit = vi.fn()
      const { submit } = useForm({
        initialValues: { name: 'John' },
        onSubmit
      })

      await submit()

      expect(onSubmit).toHaveBeenCalledWith({ name: 'John' })
    })

    it('resets submitting state after submission', async () => {
      const { submit, submitting } = useForm({
        initialValues: { name: 'test' },
        onSubmit: async () => {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      })

      expect(submitting.value).toBe(false)
      await submit()
      expect(submitting.value).toBe(false)
    })

    it('increments submitCount on successful submission', async () => {
      const { submit, submitCount } = useForm({
        onSubmit: () => {}
      })

      await submit()
      expect(submitCount.value).toBe(1)

      await submit()
      expect(submitCount.value).toBe(2)
    })
  })

  describe('reset', () => {
    it('resets form to initial values', () => {
      const { values, setFieldValue, reset } = useForm({
        initialValues: { name: 'John' }
      })

      setFieldValue('name', 'Jane')
      reset()

      expect(values.name).toBe('John')
    })

    it('clears dirty state', () => {
      const { dirty, setFieldValue, reset, registerField } = useForm({
        initialValues: { name: '' }
      })

      registerField('name', { type: 'string' })
      setFieldValue('name', 'John')
      reset()

      expect(dirty.value).toBe(false)
    })

    it('clears touched state', () => {
      const { touched, setFieldTouched, reset } = useForm({
        initialValues: { name: '' }
      })

      setFieldTouched('name', true)
      reset()

      expect(touched.name).toBeFalsy()
    })
  })
})
