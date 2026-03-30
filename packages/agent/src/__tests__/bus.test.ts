import { describe, it, expect, vi } from 'vitest'
import { FormAgentBus } from '../bus'

describe('FormAgentBus', () => {
  it('on + emit: listener receives data', () => {
    const bus = new FormAgentBus()
    const listener = vi.fn()
    bus.on('schema:change', listener)

    const schema = { type: 'object' as const, properties: {} }
    bus.emit('schema:change', schema)

    expect(listener).toHaveBeenCalledWith(schema)
  })

  it('off: removes listener, subsequent emit does not call it', () => {
    const bus = new FormAgentBus()
    const listener = vi.fn()
    bus.on('schema:change', listener)
    bus.off('schema:change', listener)

    bus.emit('schema:change', { type: 'object', properties: {} })

    expect(listener).not.toHaveBeenCalled()
  })

  it('on() returns unsubscribe function that removes listener', () => {
    const bus = new FormAgentBus()
    const listener = vi.fn()
    const unsubscribe = bus.on('schema:change', listener)

    unsubscribe()
    bus.emit('schema:change', { type: 'object', properties: {} })

    expect(listener).not.toHaveBeenCalled()
  })

  it('multiple listeners all receive the same event', () => {
    const bus = new FormAgentBus()
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    bus.on('schema:change', listener1)
    bus.on('schema:change', listener2)

    const schema = { type: 'object' as const, properties: {} }
    bus.emit('schema:change', schema)

    expect(listener1).toHaveBeenCalledWith(schema)
    expect(listener2).toHaveBeenCalledWith(schema)
  })

  it('emit with no listeners: no error (silent)', () => {
    const bus = new FormAgentBus()
    expect(() => {
      bus.emit('schema:change', { type: 'object', properties: {} })
    }).not.toThrow()
  })

  it('off for non-existent listener: no error (silent)', () => {
    const bus = new FormAgentBus()
    const listener = vi.fn()
    expect(() => {
      bus.off('schema:change', listener)
    }).not.toThrow()
  })
})
