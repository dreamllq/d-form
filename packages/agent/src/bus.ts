import type { z } from 'zod'
import type { FormSchema } from '@d-form/shared'

type Listener<T> = (data: T) => void

interface BusEvents {
  'schema:change': z.infer<typeof FormSchema>
}

export class FormAgentBus {
  private listeners = new Map<string, Set<Listener<unknown>>>()
  private currentSchema: z.infer<typeof FormSchema> | null = null

  getCurrentSchema(): z.infer<typeof FormSchema> | null {
    return this.currentSchema
  }

  setCurrentSchema(schema: z.infer<typeof FormSchema>): void {
    if (JSON.stringify(this.currentSchema) === JSON.stringify(schema)) {
      return
    }
    this.currentSchema = schema
  }

  on<K extends keyof BusEvents>(event: K, listener: Listener<BusEvents[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener as Listener<unknown>)
    return () => this.off(event, listener)
  }

  off<K extends keyof BusEvents>(event: K, listener: Listener<BusEvents[K]>): void {
    this.listeners.get(event)?.delete(listener as Listener<unknown>)
  }

  emit<K extends keyof BusEvents>(event: K, data: BusEvents[K]): void {
    this.listeners.get(event)?.forEach((listener) => {
      listener(data)
    })
  }
}
