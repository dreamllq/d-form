import { describe, it, expect, beforeEach } from 'vitest'
import { createForm, type Form } from '@d-form/core'
import { useField } from '../composables/useField'

describe('useField', () => {
  let form: Form

  beforeEach(() => {
    form = createForm({
      initialValues: { name: '', email: '' }
    })
  })

  describe('initialization', () => {
    it('creates field with initial value', () => {
      const { value } = useField('name', form)

      expect(value.value).toBe('')
    })

    it('creates field with schema', () => {
      const { field } = useField('name', form, {
        schema: { type: 'string', title: 'Name' }
      })

      expect(field).toBeDefined()
      expect(field?.meta.schema.title).toBe('Name')
    })

    it('registers field if not exists', () => {
      expect(form.hasField('newField')).toBe(false)

      const { field } = useField('newField', form)

      expect(form.hasField('newField')).toBe(true)
      expect(field).toBeDefined()
    })

    it('returns existing field if already registered', () => {
      form.registerField('name', { type: 'string' })

      const { field } = useField('name', form)

      expect(field).toBeDefined()
    })
  })

  describe('reactive state', () => {
    it('returns reactive value', () => {
      const { value } = useField('name', form)

      expect(value.value).toBe('')
    })

    it('returns reactive error', () => {
      const { error } = useField('name', form)

      expect(error.value).toBeUndefined()
    })

    it('returns reactive touched', () => {
      const { touched } = useField('name', form)

      expect(touched.value).toBe(false)
    })

    it('returns reactive dirty', () => {
      const { dirty } = useField('name', form)

      expect(dirty.value).toBe(false)
    })

    it('returns reactive visible', () => {
      const { visible } = useField('name', form)

      expect(visible.value).toBe(true)
    })

    it('returns reactive disabled', () => {
      const { disabled } = useField('name', form)

      expect(disabled.value).toBe(false)
    })

    it('returns reactive validating', () => {
      const { validating } = useField('name', form)

      expect(validating.value).toBe(false)
    })
  })

  describe('setValue', () => {
    it('sets field value', () => {
      const { value, setValue } = useField('name', form)

      setValue('John')

      expect(value.value).toBe('John')
    })

    it('updates form value', () => {
      const { setValue } = useField('name', form)

      setValue('John')

      expect(form.getFieldValue('name')).toBe('John')
    })
  })

  describe('setTouched', () => {
    it('sets field touched state', () => {
      const { touched, setTouched } = useField('name', form)

      setTouched(true)

      expect(touched.value).toBe(true)
    })
  })

  describe('validate', () => {
    it('validates field and returns result', async () => {
      form.registerField('name', {
        type: 'string',
        validation: {
          rules: [{ type: 'required', message: 'Name is required' }]
        }
      })

      const { validate } = useField('name', form)

      const result = await validate()

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Name is required')
    })

    it('returns valid result when no validation rules', async () => {
      const { validate } = useField('name', form)

      const result = await validate()

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })
  })

  describe('field reference', () => {
    it('returns field instance', () => {
      const { field } = useField('name', form)

      expect(field).toBeDefined()
      expect(field?.meta.path).toBe('name')
    })
  })

  describe('state sync on field change', () => {
    it('syncs error state when field state changes', () => {
      const { field, error } = useField('name', form)

      field?.setError('Custom error')

      expect(error.value).toBe('Custom error')
    })

    it('syncs visible state when field state changes', () => {
      const { field, visible } = useField('name', form)

      field?.setVisible(false)

      expect(visible.value).toBe(false)
    })

    it('syncs disabled state when field state changes', () => {
      const { field, disabled } = useField('name', form)

      field?.setDisabled(true)

      expect(disabled.value).toBe(true)
    })
  })
})
