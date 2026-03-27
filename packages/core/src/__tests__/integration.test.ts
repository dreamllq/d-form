import { describe, it, expect, vi } from 'vitest'
import { createForm } from '../models/form'
import { createReaction } from '../models/reaction'

describe('Integration Tests', () => {
  describe('Complete Form Workflow', () => {
    it('should handle complete form lifecycle: create -> input -> validate -> submit', async () => {
      const onSubmit = vi.fn()
      
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            username: { 
              type: 'string',
              validation: { rules: [{ type: 'required' }, { type: 'minLength', value: 3 }] }
            },
            email: { 
              type: 'string',
              validation: { rules: [{ type: 'required' }, { type: 'pattern', value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }] }
            }
          }
        },
        onSubmit
      })

      expect(form.getState().submitCount).toBe(0)
      expect(form.getState().submitted).toBe(false)
      expect(form.hasField('username')).toBe(true)
      expect(form.hasField('email')).toBe(true)

      await form.submit()
      expect(onSubmit).not.toHaveBeenCalled()
      expect(form.getState().isValid).toBe(false)
      expect(form.getState().submitCount).toBe(0)

      form.setFieldValue('username', 'ab')
      form.setFieldValue('email', 'invalid-email')
      
      const validationResult = await form.validate()
      expect(validationResult.valid).toBe(false)
      expect(validationResult.fields.username.valid).toBe(false)
      expect(validationResult.fields.email.valid).toBe(false)

      form.setFieldValue('username', 'validuser')
      form.setFieldValue('email', 'valid@example.com')

      const validResult = await form.validate()
      expect(validResult.valid).toBe(true)
      expect(form.getState().isValid).toBe(true)

      await form.submit()
      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit).toHaveBeenCalledWith({
        username: 'validuser',
        email: 'valid@example.com'
      })
      expect(form.getState().submitCount).toBe(1)
      expect(form.getState().submitted).toBe(true)
    })

    it('should track dirty and touched states throughout form lifecycle', async () => {
      const form = createForm({
        initialValues: { name: 'John', email: 'john@example.com' },
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' }
          }
        }
      })

      expect(form.getState().dirty).toBe(false)
      expect(form.getFieldState('name')?.touched).toBe(false)

      form.setFieldValue('name', 'Jane')
      expect(form.getState().dirty).toBe(true)
      expect(form.getFieldState('name')?.dirty).toBe(true)

      form.setFieldTouched('name', true)
      expect(form.getFieldState('name')?.touched).toBe(true)

      form.reset()
      expect(form.getState().dirty).toBe(false)
      expect(form.getFieldState('name')?.touched).toBe(false)
      expect(form.getFieldState('name')?.dirty).toBe(false)
      expect(form.getFieldValue('name')).toBe('John')
    })

    it('should handle nested field values in complete workflow', async () => {
      const onSubmit = vi.fn()
      
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            'user.name': { type: 'string', validation: { rules: [{ type: 'required' }] } },
            'user.email': { type: 'string' },
            'address.city': { type: 'string' },
            'address.zip': { type: 'string' }
          }
        },
        onSubmit
      })

      form.setFieldValue('user.name', 'John Doe')
      form.setFieldValue('user.email', 'john@example.com')
      form.setFieldValue('address.city', 'New York')
      form.setFieldValue('address.zip', '10001')

      expect(form.getFieldValue('user')).toEqual({
        name: 'John Doe',
        email: 'john@example.com'
      })
      expect(form.getFieldValue('address')).toEqual({
        city: 'New York',
        zip: '10001'
      })

      await form.submit()
      expect(onSubmit).toHaveBeenCalledWith({
        user: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        address: {
          city: 'New York',
          zip: '10001'
        }
      })
    })
  })

  describe('Multi-field Linkage (Reactions)', () => {
    it('should handle country-city cascading linkage', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            country: { type: 'string' },
            city: { type: 'string' }
          }
        }
      })

      const reaction = createReaction(form, 'country', {
        target: 'city',
        when: '{{$self.value === "US"}}',
        fulfill: {
          state: { value: 'New York' }
        },
        otherwise: {
          state: { value: 'Other' }
        }
      })

      form.setFieldValue('country', 'US')
      expect(form.getFieldValue('city')).toBe('New York')

      form.setFieldValue('country', 'UK')
      expect(form.getFieldValue('city')).toBe('Other')

      reaction.dispose()
    })

    it('should handle show/hide field based on another field value', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            hasDiscount: { type: 'boolean' },
            discountCode: { type: 'string' }
          }
        }
      })

      const reaction = createReaction(form, 'hasDiscount', {
        target: 'discountCode',
        fulfill: {
          state: { visible: '{{$self.value === true}}' }
        }
      })
      reaction.run()
      expect(form.getField('discountCode')?.getState().visible).toBe(false)

      form.setFieldValue('hasDiscount', true)
      expect(form.getField('discountCode')?.getState().visible).toBe(true)

      form.setFieldValue('hasDiscount', false)
      expect(form.getField('discountCode')?.getState().visible).toBe(false)
      
      reaction.dispose()
    })

    it('should handle enable/disable based on multiple dependencies', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            agreeTerms: { type: 'boolean' },
            agreePrivacy: { type: 'boolean' },
            submitBtn: { type: 'string' }
          }
        }
      })

      createReaction(form, 'submitBtn', {
        dependencies: ['agreeTerms', 'agreePrivacy'],
        when: '{{$deps[0] === true && $deps[1] === true}}',
        fulfill: {
          state: { disabled: false }
        },
        otherwise: {
          state: { disabled: true }
        }
      })

      expect(form.getField('submitBtn')?.getState().disabled).toBe(true)

      form.setFieldValue('agreeTerms', true)
      expect(form.getField('submitBtn')?.getState().disabled).toBe(true)

      form.setFieldValue('agreePrivacy', true)
      expect(form.getField('submitBtn')?.getState().disabled).toBe(false)

      form.setFieldValue('agreeTerms', false)
      expect(form.getField('submitBtn')?.getState().disabled).toBe(true)
    })

    it('should handle multi-target reactions', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            mode: { type: 'string' },
            field1: { type: 'string' },
            field2: { type: 'string' },
            field3: { type: 'string' }
          }
        }
      })

      createReaction(form, 'mode', {
        target: ['field1', 'field2', 'field3'],
        when: '{{$self.value === "readonly"}}',
        fulfill: {
          state: { disabled: true }
        },
        otherwise: {
          state: { disabled: false }
        }
      })

      expect(form.getField('field1')?.getState().disabled).toBe(false)
      expect(form.getField('field2')?.getState().disabled).toBe(false)
      expect(form.getField('field3')?.getState().disabled).toBe(false)

      form.setFieldValue('mode', 'readonly')
      expect(form.getField('field1')?.getState().disabled).toBe(true)
      expect(form.getField('field2')?.getState().disabled).toBe(true)
      expect(form.getField('field3')?.getState().disabled).toBe(true)

      form.setFieldValue('mode', 'edit')
      expect(form.getField('field1')?.getState().disabled).toBe(false)
      expect(form.getField('field2')?.getState().disabled).toBe(false)
      expect(form.getField('field3')?.getState().disabled).toBe(false)
    })

    it('should handle copy value from one field to another', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            source: { type: 'string' },
            target: { type: 'string' }
          }
        }
      })

      createReaction(form, 'source', {
        target: 'target',
        fulfill: {
          state: { value: '{{$self.value}}' }
        }
      })

      form.setFieldValue('source', 'Hello')
      expect(form.getFieldValue('target')).toBe('Hello')

      form.setFieldValue('source', 'World')
      expect(form.getFieldValue('target')).toBe('World')
    })

    it('should stop reacting after dispose', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            trigger: { type: 'string' },
            target: { type: 'string' }
          }
        }
      })

      const reaction = createReaction(form, 'trigger', {
        target: 'target',
        fulfill: {
          state: { value: 'reacted' }
        }
      })

      form.setFieldValue('trigger', 'first')
      expect(form.getFieldValue('target')).toBe('reacted')

      reaction.dispose()

      form.setFieldValue('target', 'manual')
      form.setFieldValue('trigger', 'second')
      expect(form.getFieldValue('target')).toBe('manual')
    })
  })

  describe('Validation Scenarios (Sync + Async)', () => {
    it('should validate form with mixed sync and async validators', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            username: { 
              type: 'string',
              validation: { 
                rules: [
                  { type: 'required' },
                  { type: 'minLength', value: 3 },
                  {
                    type: 'custom',
                    validator: async (value: string) => {
                      await new Promise(r => setTimeout(r, 10))
                      return value !== 'taken'
                    },
                    message: 'Username is already taken'
                  }
                ]
              }
            },
            email: {
              type: 'string',
              validation: {
                rules: [
                  { type: 'required' },
                  { type: 'pattern', value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                ]
              }
            }
          }
        }
      })

      form.setFieldValue('username', 'ab')
      const syncResult = await form.validate()
      expect(syncResult.valid).toBe(false)

      form.setFieldValue('username', 'taken')
      form.setFieldValue('email', 'valid@example.com')
      const asyncFailResult = await form.validate()
      expect(asyncFailResult.valid).toBe(false)
      expect(asyncFailResult.fields.username.errors).toContain('Username is already taken')

      form.setFieldValue('username', 'available')
      const successResult = await form.validate()
      expect(successResult.valid).toBe(true)
    })

    it('should track validating state during async validation', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              validation: {
                rules: [{
                  type: 'custom',
                  validator: async (value: string) => {
                    await new Promise(r => setTimeout(r, 50))
                    return value.length >= 3
                  },
                  message: 'Too short'
                }]
              }
            }
          }
        }
      })

      form.setFieldValue('field', 'ab')
      
      expect(form.getField('field')?.getState().validating).toBe(false)
      const promise = form.validateField('field')
      expect(form.getField('field')?.getState().validating).toBe(true)
      
      await promise
      
      expect(form.getField('field')?.getState().validating).toBe(false)
      expect(form.getField('field')?.getError()).toBe('Too short')
    })

    it('should validate multiple fields in parallel', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            field1: {
              type: 'string',
              validation: {
                rules: [{
                  type: 'custom',
                  validator: async () => {
                    await new Promise(r => setTimeout(r, 30))
                    return true
                  }
                }]
              }
            },
            field2: {
              type: 'string',
              validation: {
                rules: [{
                  type: 'custom',
                  validator: async () => {
                    await new Promise(r => setTimeout(r, 30))
                    return true
                  }
                }]
              }
            },
            field3: {
              type: 'string',
              validation: {
                rules: [{
                  type: 'custom',
                  validator: async () => {
                    await new Promise(r => setTimeout(r, 30))
                    return true
                  }
                }]
              }
            }
          }
        }
      })

      form.setFieldValue('field1', 'value1')
      form.setFieldValue('field2', 'value2')
      form.setFieldValue('field3', 'value3')

      const startTime = Date.now()
      const result = await form.validate()
      const duration = Date.now() - startTime

      expect(result.valid).toBe(true)
      expect(duration).toBeLessThan(100)
    })

    it('should handle validation on blur trigger', async () => {
      const form = createForm({
        validateOnBlur: true,
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              validation: {
                rules: [{ type: 'required' }],
                trigger: 'blur'
              }
            }
          }
        }
      })

      const field = form.getField('name')
      
      field?.setValue('')
      expect(field?.getError()).toBeUndefined()

      field?.setTouched(true)
      expect(field?.getError()).toBeDefined()
    })

    it('should handle validation on change trigger', async () => {
      const form = createForm({
        validateOnChange: true,
        schema: {
          type: 'object',
          properties: {
            password: {
              type: 'string',
              validation: {
                rules: [{ type: 'minLength', value: 8, message: 'Too short' }],
                trigger: 'change'
              }
            }
          }
        }
      })

      const field = form.getField('password')

      field?.setValue('short')
      expect(field?.getError()).toBe('Too short')

      field?.setValue('longenough')
      expect(field?.getError()).toBeUndefined()
    })

    it('should skip validation for hidden fields when configured', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            visible: {
              type: 'string',
              visible: true,
              validation: {
                rules: [{ type: 'required' }],
                validateVisibleOnly: true
              }
            },
            hidden: {
              type: 'string',
              visible: false,
              validation: {
                rules: [{ type: 'required' }],
                validateVisibleOnly: true
              }
            }
          }
        }
      })

      const result = await form.validate()

      expect(result.fields.visible).toBeDefined()
      expect(result.fields.hidden).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    it('should collect and display errors from multiple fields', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              validation: { rules: [{ type: 'required', message: 'Name is required' }] }
            },
            email: {
              type: 'string',
              validation: { rules: [{ type: 'required', message: 'Email is required' }] }
            },
            age: {
              type: 'number',
              validation: { rules: [{ type: 'min', value: 18, message: 'Must be 18 or older' }] }
            }
          }
        }
      })

      form.setFieldValue('age', 15)
      
      const result = await form.validate()

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Name is required')
      expect(result.errors).toContain('Email is required')
      expect(result.errors).toContain('Must be 18 or older')
      expect(result.errors.length).toBe(3)
    })

    it('should handle async validator that throws error', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              validation: {
                rules: [{
                  type: 'custom',
                  validator: async () => {
                    throw new Error('Network error')
                  },
                  message: 'Validation failed due to network error'
                }]
              }
            }
          }
        }
      })

      form.setFieldValue('field', 'test')
      const result = await form.validate()

      expect(result.valid).toBe(false)
      expect(result.fields.field.errors).toContain('Validation failed due to network error')
    })

    it('should clear errors when form is reset', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              validation: { rules: [{ type: 'required' }] }
            }
          }
        }
      })

      await form.validate()
      expect(form.getFieldError('name')).toBeDefined()

      form.reset()
      expect(form.getFieldError('name')).toBeUndefined()
    })

    it('should clear errors manually', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            field1: { type: 'string' },
            field2: { type: 'string' }
          }
        }
      })

      form.setFieldError('field1', 'Error 1')
      form.setFieldError('field2', 'Error 2')

      expect(form.getErrors()).toEqual({
        field1: 'Error 1',
        field2: 'Error 2'
      })

      form.clearErrors()

      expect(form.getErrors()).toEqual({})
      expect(form.getState().isValid).toBe(true)
    })

    it('should prevent submission when validation fails', async () => {
      const onSubmit = vi.fn()
      
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            required: {
              type: 'string',
              validation: { rules: [{ type: 'required' }] }
            }
          }
        },
        onSubmit
      })

      await form.submit()

      expect(onSubmit).not.toHaveBeenCalled()
      expect(form.getState().submitCount).toBe(0)
      expect(form.getState().submitted).toBe(false)
    })

    it('should handle circular dependency detection in reactions', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            field1: { type: 'string' },
            field2: { type: 'string' }
          }
        }
      })

      expect(() => {
        createReaction(form, 'field1', {
          dependencies: ['field2'],
          target: 'field2',
          fulfill: { state: { visible: true } }
        })
      }).toThrow(/Circular dependency detected/)
    })
  })

  describe('Real-world Scenarios', () => {
    it('should handle registration form with confirm password validation', async () => {
      const onSubmit = vi.fn()
      
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              validation: {
                rules: [
                  { type: 'required', message: 'Username is required' },
                  { type: 'minLength', value: 3, message: 'Username must be at least 3 characters' }
                ]
              }
            },
            password: {
              type: 'string',
              validation: {
                rules: [
                  { type: 'required', message: 'Password is required' },
                  { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' }
                ]
              }
            },
            confirmPassword: {
              type: 'string',
              validation: {
                rules: [
                  { type: 'required', message: 'Please confirm your password' },
                  {
                    type: 'custom',
                    validator: (value: string) => {
                      return value === form.getFieldValue('password')
                    },
                    message: 'Passwords do not match'
                  }
                ]
              }
            }
          }
        },
        onSubmit
      })

      form.setFieldValue('username', 'validuser')
      form.setFieldValue('password', 'validpass123')
      form.setFieldValue('confirmPassword', 'validpass123')

      const result = await form.validate()
      expect(result.valid).toBe(true)

      await form.submit()
      expect(onSubmit).toHaveBeenCalled()
    })

    it('should handle dynamic form with conditional fields', async () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            accountType: { type: 'string' },
            companyName: { type: 'string' },
            companySize: { type: 'string' }
          }
        }
      })

      createReaction(form, 'accountType', {
        target: ['companyName', 'companySize'],
        when: '{{$self.value === "business"}}',
        fulfill: {
          state: { visible: true }
        },
        otherwise: {
          state: { visible: false }
        }
      })

      form.setFieldValue('accountType', 'personal')
      expect(form.getField('companyName')?.getState().visible).toBe(false)
      expect(form.getField('companySize')?.getState().visible).toBe(false)

      form.setFieldValue('accountType', 'business')
      expect(form.getField('companyName')?.getState().visible).toBe(true)
      expect(form.getField('companySize')?.getState().visible).toBe(true)
    })

    it('should handle form with computed fields', () => {
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            price: { type: 'number' },
            quantity: { type: 'number' },
            total: { type: 'number' }
          }
        }
      })

      createReaction(form, 'total', {
        dependencies: ['price', 'quantity'],
        fulfill: {
          state: { 
            value: '{{($dependencies.price || 0) * ($dependencies.quantity || 0)}}' 
          }
        }
      })

      form.setFieldValue('price', 10)
      form.setFieldValue('quantity', 5)
      expect(form.getFieldValue('total')).toBe(50)

      form.setFieldValue('price', 20)
      expect(form.getFieldValue('total')).toBe(100)

      form.setFieldValue('quantity', 3)
      expect(form.getFieldValue('total')).toBe(60)
    })

    it('should handle form state persistence and restoration', () => {
      const form = createForm({
        initialValues: { name: 'John', email: 'john@example.com' },
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' }
          }
        }
      })

      form.setFieldValue('name', 'Jane')
      form.setFieldTouched('name', true)
      form.setFieldError('email', 'Invalid')

      const savedValues = form.getValues()

      const restoredForm = createForm({
        initialValues: savedValues,
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' }
          }
        }
      })

      expect(restoredForm.getFieldValue('name')).toBe('Jane')
      expect(restoredForm.getFieldValue('email')).toBe('john@example.com')
    })

    it('should handle async username availability check', async () => {
      const takenUsernames = ['admin', 'user', 'test']
      
      const form = createForm({
        schema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              validation: {
                rules: [
                  { type: 'required', message: 'Username is required' },
                  { type: 'minLength', value: 3, message: 'Username too short' },
                  {
                    type: 'custom',
                    validator: async (value: string) => {
                      await new Promise(r => setTimeout(r, 20))
                      return !takenUsernames.includes(value)
                    },
                    message: 'Username is already taken'
                  }
                ]
              }
            }
          }
        }
      })

      form.setFieldValue('username', 'admin')
      let result = await form.validate()
      expect(result.valid).toBe(false)
      expect(result.fields.username.errors).toContain('Username is already taken')

      form.setFieldValue('username', 'newuser')
      result = await form.validate()
      expect(result.valid).toBe(true)
    })
  })
})
