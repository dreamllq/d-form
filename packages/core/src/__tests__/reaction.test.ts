import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Form, createForm } from '../models/form'
import { Field } from '../models/field'
import { Reaction, createReaction } from '../models/reaction'

describe('Reaction', () => {
  let form: Form

  beforeEach(() => {
    form = createForm({
      schema: {
        type: 'object',
        properties: {
          source: { type: 'string' },
          target: { type: 'string' },
          target2: { type: 'string' },
          dependency: { type: 'string' },
          dep1: { type: 'string' },
          dep2: { type: 'string' }
        }
      }
    })
  })

  describe('passive mode (dependencies)', () => {
    it('should trigger reaction when dependency value changes', () => {
      const reaction = new Reaction(form, 'target', {
        dependencies: ['dependency'],
        fulfill: {
          state: { visible: true }
        }
      })

      form.setFieldValue('dependency', 'trigger')
      const targetField = form.getField('target')
      expect(targetField?.getState().visible).toBe(true)
    })

    it('should not trigger reaction when non-dependency changes', () => {
      const reaction = new Reaction(form, 'target', {
        dependencies: ['dependency'],
        fulfill: {
          state: { visible: false }
        }
      })

      form.setFieldValue('source', 'no-trigger')
      const targetField = form.getField('target')
      expect(targetField?.getState().visible).toBe(true)
    })

    it('should support multiple dependencies', () => {
      const reaction = new Reaction(form, 'target', {
        dependencies: ['dep1', 'dep2'],
        fulfill: {
          state: { visible: true }
        }
      })

      form.setFieldValue('dep1', 'value1')
      expect(form.getField('target')?.getState().visible).toBe(true)

      form.setFieldValue('dep2', 'value2')
      expect(form.getField('target')?.getState().visible).toBe(true)
    })
  })

  describe('active mode (target)', () => {
    it('should target specified field instead of source', () => {
      const reaction = new Reaction(form, 'source', {
        target: 'target',
        fulfill: {
          state: { disabled: true }
        }
      })

      form.setFieldValue('source', 'trigger')
      expect(form.getField('target')?.getState().disabled).toBe(true)
    })

    it('should support multiple targets', () => {
      const reaction = new Reaction(form, 'source', {
        target: ['target', 'target2'],
        fulfill: {
          state: { disabled: true }
        }
      })

      form.setFieldValue('source', 'trigger')
      expect(form.getField('target')?.getState().disabled).toBe(true)
      expect(form.getField('target2')?.getState().disabled).toBe(true)
    })

    it('should default to source field when no target specified', () => {
      const reaction = new Reaction(form, 'source', {
        when: '{{$self.value === "hide"}}',
        fulfill: {
          state: { visible: false }
        }
      })

      form.setFieldValue('source', 'hide')
      expect(form.getField('source')?.getState().visible).toBe(false)
    })
  })

  describe('when condition evaluation', () => {
    it('should apply fulfill when condition is true', () => {
      const reaction = new Reaction(form, 'source', {
        target: 'target',
        when: '{{$self.value === "yes"}}',
        fulfill: {
          state: { visible: true }
        },
        otherwise: {
          state: { visible: false }
        }
      })

      form.setFieldValue('source', 'yes')
      expect(form.getField('target')?.getState().visible).toBe(true)
    })

    it('should apply otherwise when condition is false', () => {
      const reaction = new Reaction(form, 'source', {
        target: 'target',
        when: '{{$self.value === "yes"}}',
        fulfill: {
          state: { visible: true }
        },
        otherwise: {
          state: { visible: false }
        }
      })

      form.setFieldValue('source', 'no')
      expect(form.getField('target')?.getState().visible).toBe(false)
    })

    it('should always apply fulfill when no condition specified', () => {
      const reaction = new Reaction(form, 'source', {
        target: 'target',
        fulfill: {
          state: { disabled: true }
        }
      })

      form.setFieldValue('source', 'anything')
      expect(form.getField('target')?.getState().disabled).toBe(true)
    })

    it('should evaluate dependency values in condition', () => {
      const reaction = new Reaction(form, 'target', {
        dependencies: ['dependency'],
        when: '{{$deps[0] === "show"}}',
        fulfill: {
          state: { visible: true }
        },
        otherwise: {
          state: { visible: false }
        }
      })

      form.setFieldValue('dependency', 'show')
      expect(form.getField('target')?.getState().visible).toBe(true)

      form.setFieldValue('dependency', 'hide')
      expect(form.getField('target')?.getState().visible).toBe(false)
    })
  })

  describe('state changes', () => {
    it('should change visible state', () => {
      const reaction = new Reaction(form, 'source', {
        target: 'target',
        when: '{{$self.value === "hide"}}',
        fulfill: {
          state: { visible: false }
        }
      })

      form.setFieldValue('source', 'hide')
      expect(form.getField('target')?.getState().visible).toBe(false)
    })

    it('should change disabled state', () => {
      const reaction = new Reaction(form, 'source', {
        target: 'target',
        when: '{{$self.value === "disable"}}',
        fulfill: {
          state: { disabled: true }
        }
      })

      form.setFieldValue('source', 'disable')
      expect(form.getField('target')?.getState().disabled).toBe(true)
    })

    it('should change multiple states at once', () => {
      const reaction = new Reaction(form, 'source', {
        target: 'target',
        when: '{{$self.value === "both"}}',
        fulfill: {
          state: { visible: false, disabled: true }
        }
      })

      form.setFieldValue('source', 'both')
      const targetState = form.getField('target')?.getState()
      expect(targetState?.visible).toBe(false)
      expect(targetState?.disabled).toBe(true)
    })
  })

  describe('expression evaluation in effects', () => {
    it('should evaluate expression in state value', () => {
      const reaction = new Reaction(form, 'source', {
        target: 'target',
        when: '{{$self.value}}',
        fulfill: {
          state: { value: '{{$self.value}}' }
        }
      })

      form.setFieldValue('source', 'copied')
      expect(form.getFieldValue('target')).toBe('copied')
    })

    it('should access $deps array in expression', () => {
      const reaction = new Reaction(form, 'target', {
        dependencies: ['dep1', 'dep2'],
        fulfill: {
          state: { value: '{{$deps[0] + " " + $deps[1]}}' }
        }
      })

      form.setFieldValue('dep1', 'Hello')
      form.setFieldValue('dep2', 'World')
      expect(form.getFieldValue('target')).toBe('Hello World')
    })

    it('should access $values in expression', () => {
      const reaction = new Reaction(form, 'source', {
        target: 'target',
        when: '{{$values.source === "trigger"}}',
        fulfill: {
          state: { visible: true }
        }
      })

      form.setFieldValue('source', 'trigger')
      expect(form.getField('target')?.getState().visible).toBe(true)
    })

    it('should access $dependencies object in expression', () => {
      const reaction = new Reaction(form, 'target', {
        dependencies: ['dep1', 'dep2'],
        fulfill: {
          state: { value: '{{$dependencies.dep1}}' }
        }
      })

      form.setFieldValue('dep1', 'named-dep')
      expect(form.getFieldValue('target')).toBe('named-dep')
    })

    it('should execute run command', () => {
      const mockFn = vi.fn()
      globalThis.mockFn = mockFn

      const reaction = new Reaction(form, 'source', {
        target: 'target',
        when: '{{$self.value === "run"}}',
        fulfill: {
          run: '{{globalThis.mockFn("executed")}}'
        }
      })

      form.setFieldValue('source', 'run')
      expect(mockFn).toHaveBeenCalledWith('executed')
    })

  })

  describe('circular dependency detection', () => {
    it('should throw error when target is also a dependency', () => {
      expect(() => {
        new Reaction(form, 'source', {
          dependencies: ['target'],
          target: 'target',
          fulfill: { state: { visible: true } }
        })
      }).toThrow(/Circular dependency detected/)
    })

    it('should throw error when source depends on itself', () => {
      expect(() => {
        new Reaction(form, 'source', {
          dependencies: ['source'],
          fulfill: { state: { visible: true } }
        })
      }).toThrow(/Circular dependency detected/)
    })
  })

  describe('dispose', () => {
    it('should stop reacting after dispose', () => {
      const reaction = new Reaction(form, 'source', {
        target: 'target',
        fulfill: {
          state: { disabled: true }
        }
      })

      reaction.dispose()
      form.setFieldValue('source', 'trigger')
      
      expect(form.getField('target')?.getState().disabled).toBe(false)
    })

    it('should report disposed state', () => {
      const reaction = new Reaction(form, 'source', {
        target: 'target',
        fulfill: { state: { visible: true } }
      })

      expect(reaction.isDisposed()).toBe(false)
      reaction.dispose()
      expect(reaction.isDisposed()).toBe(true)
    })

    it('should handle multiple dispose calls', () => {
      const reaction = new Reaction(form, 'source', {
        target: 'target',
        fulfill: { state: { visible: true } }
      })

      reaction.dispose()
      reaction.dispose()
      expect(reaction.isDisposed()).toBe(true)
    })
  })

  describe('createReaction factory', () => {
    it('should create reaction using factory function', () => {
      const reaction = createReaction(form, 'source', {
        target: 'target',
        fulfill: { state: { disabled: true } }
      })

      form.setFieldValue('source', 'trigger')
      expect(form.getField('target')?.getState().disabled).toBe(true)
    })
  })
})
