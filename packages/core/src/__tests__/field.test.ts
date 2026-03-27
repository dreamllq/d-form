import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { FieldSchema, FieldState } from '@d-form/shared'

import { createForm } from '../models/form'

describe('Field State Management', () => {
  describe('field initialization', () => {
    it('should initialize field with default value', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string', default: 'default value' })
      expect(field.getValue()).toBe('default value')
    })

    it('should initialize field with undefined if no default', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      expect(field.getValue()).toBeUndefined()
    })

    it('should initialize field with visible=true by default', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      expect(field.getState().visible).toBe(true)
    })

    it('should initialize field with disabled=false by default', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      expect(field.getState().disabled).toBe(false)
    })

    it('should initialize field with touched=false by default', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      expect(field.getState().touched).toBe(false)
    })

    it('should initialize field with dirty=false by default', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      expect(field.getState().dirty).toBe(false)
    })

    it('should respect initial disabled state from schema', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string', disabled: true })
      expect(field.getState().disabled).toBe(true)
    })

    it('should respect initial visible state from schema', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string', visible: false })
      expect(field.getState().visible).toBe(false)
    })
  })

  describe('value changes', () => {
    it('should update field value', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      field.setValue('new value')
      expect(field.getValue()).toBe('new value')
    })

    it('should emit value change event', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      const handler = vi.fn()
      field.on('valueChange', handler)
      field.setValue('new value')
      expect(handler).toHaveBeenCalledWith('new value', undefined)
    })

    it('should include old value in change event', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string', default: 'old' })
      const handler = vi.fn()
      field.on('valueChange', handler)
      field.setValue('new value')
      expect(handler).toHaveBeenCalledWith('new value', 'old')
    })

    it('should not emit event when value is same', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string', default: 'same' })
      const handler = vi.fn()
      field.on('valueChange', handler)
      field.setValue('same')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should support different value types', () => {
      const form = createForm()
      
      const stringField = form.registerField('str', { type: 'string' })
      stringField.setValue('text')
      expect(stringField.getValue()).toBe('text')
      
      const numberField = form.registerField('num', { type: 'number' })
      numberField.setValue(42)
      expect(numberField.getValue()).toBe(42)
      
      const boolField = form.registerField('bool', { type: 'boolean' })
      boolField.setValue(true)
      expect(boolField.getValue()).toBe(true)
      
      const objectField = form.registerField('obj', { type: 'object' })
      objectField.setValue({ key: 'value' })
      expect(objectField.getValue()).toEqual({ key: 'value' })
      
      const arrayField = form.registerField('arr', { type: 'array' })
      arrayField.setValue([1, 2, 3])
      expect(arrayField.getValue()).toEqual([1, 2, 3])
    })
  })

  describe('dirty state', () => {
    it('should be dirty after value change', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      expect(field.getState().dirty).toBe(false)
      field.setValue('changed')
      expect(field.getState().dirty).toBe(true)
    })

    it('should not be dirty if value equals original', () => {
      const form = createForm({ initialValues: { name: 'original' } })
      const field = form.registerField('name', { type: 'string' })
      field.setValue('original')
      expect(field.getState().dirty).toBe(false)
    })

    it('should reset dirty state when reset is called', () => {
      const form = createForm({ initialValues: { name: 'initial' } })
      const field = form.registerField('name', { type: 'string' })
      field.setValue('changed')
      expect(field.getState().dirty).toBe(true)
      field.reset()
      expect(field.getState().dirty).toBe(false)
    })

    it('should track dirty state for nested values', () => {
      const form = createForm({ initialValues: { user: { name: 'John' } } })
      const field = form.registerField('user', { type: 'object' })
      field.setValue({ name: 'Jane' })
      expect(field.getState().dirty).toBe(true)
    })
  })

  describe('touched state', () => {
    it('should be touched after setTouched(true)', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      expect(field.getState().touched).toBe(false)
      field.setTouched(true)
      expect(field.getState().touched).toBe(true)
    })

    it('should emit touched change event', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      const handler = vi.fn()
      field.on('touchedChange', handler)
      field.setTouched(true)
      expect(handler).toHaveBeenCalledWith(true, false)
    })

    it('should reset touched state when reset is called', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      field.setTouched(true)
      expect(field.getState().touched).toBe(true)
      field.reset()
      expect(field.getState().touched).toBe(false)
    })

    it('should not emit event when touched is same', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      const handler = vi.fn()
      field.on('touchedChange', handler)
      field.setTouched(false)
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('validation state', () => {
    it('should have validating state during async validation', async () => {
      const form = createForm()
      const field = form.registerField('name', { 
        type: 'string',
        validation: { 
          rules: [{ 
            type: 'custom', 
            validator: async () => {
              await new Promise(r => setTimeout(r, 10))
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

    it('should set error after failed validation', () => {
      const form = createForm()
      const field = form.registerField('name', { 
        type: 'string',
        validation: { rules: [{ type: 'required' }] }
      })
      field.validate()
      expect(field.getError()).toBeDefined()
    })

    it('should clear error after successful validation', () => {
      const form = createForm()
      const field = form.registerField('name', { 
        type: 'string',
        validation: { rules: [{ type: 'required' }] }
      })
      field.validate()
      expect(field.getError()).toBeDefined()
      
      field.setValue('valid value')
      field.validate()
      expect(field.getError()).toBeUndefined()
    })
  })

  describe('visible and disabled state', () => {
    it('should set visible state', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      expect(field.getState().visible).toBe(true)
      
      field.setVisible(false)
      expect(field.getState().visible).toBe(false)
      
      field.setVisible(true)
      expect(field.getState().visible).toBe(true)
    })

    it('should set disabled state', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      expect(field.getState().disabled).toBe(false)
      
      field.setDisabled(true)
      expect(field.getState().disabled).toBe(true)
      
      field.setDisabled(false)
      expect(field.getState().disabled).toBe(false)
    })

    it('should emit state change events', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      const handler = vi.fn()
      field.on('stateChange', handler)
      
      field.setVisible(false)
      expect(handler).toHaveBeenCalled()
      
      handler.mockClear()
      field.setDisabled(true)
      expect(handler).toHaveBeenCalled()
    })
  })

  describe('field reset', () => {
    it('should reset to initial value', () => {
      const form = createForm({ initialValues: { name: 'initial' } })
      const field = form.registerField('name', { type: 'string' })
      field.setValue('changed')
      field.reset()
      expect(field.getValue()).toBe('initial')
    })

    it('should reset to default value if no initial value', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string', default: 'default' })
      field.setValue('changed')
      field.reset()
      expect(field.getValue()).toBe('default')
    })

    it('should clear error on reset', () => {
      const form = createForm()
      const field = form.registerField('name', { 
        type: 'string',
        validation: { rules: [{ type: 'required' }] }
      })
      field.validate()
      expect(field.getError()).toBeDefined()
      field.reset()
      expect(field.getError()).toBeUndefined()
    })

    it('should clear touched on reset', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      field.setTouched(true)
      field.reset()
      expect(field.getState().touched).toBe(false)
    })

    it('should clear dirty on reset', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      field.setValue('changed')
      field.reset()
      expect(field.getState().dirty).toBe(false)
    })
  })

  describe('field metadata', () => {
    it('should have correct path in metadata', () => {
      const form = createForm()
      const field = form.registerField('user.name', { type: 'string' })
      expect(field.meta.path).toBe('user.name')
    })

    it('should have correct name in metadata', () => {
      const form = createForm()
      const field = form.registerField('email', { type: 'string' })
      expect(field.meta.name).toBe('email')
    })

    it('should have schema reference in metadata', () => {
      const form = createForm()
      const schema: FieldSchema = { type: 'string', title: 'Email' }
      const field = form.registerField('email', schema)
      expect(field.meta.schema).toBe(schema)
    })
  })

  describe('event subscription', () => {
    it('should support multiple listeners for same event', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      field.on('valueChange', handler1)
      field.on('valueChange', handler2)
      
      field.setValue('test')
      
      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })

    it('should support unsubscribe', () => {
      const form = createForm()
      const field = form.registerField('name', { type: 'string' })
      const handler = vi.fn()
      
      const unsubscribe = field.on('valueChange', handler)
      field.setValue('test1')
      expect(handler).toHaveBeenCalledTimes(1)
      
      unsubscribe()
      field.setValue('test2')
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })
})
