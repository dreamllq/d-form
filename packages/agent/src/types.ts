import type { ZodType, z } from 'zod'
import type { ComponentPropsRegistry } from '@d-form/shared'
import type { FormAgentBus } from './bus'

/**
 * Configuration for createFormAgent factory.
 */
export interface CreateFormAgentConfig {
  /** Agent identifier. Default: 'd-form-agent' */
  id?: string
  /** Display name. Default: 'D-Form Agent' */
  name?: string
  /** Agent description. Default: 'AI agent for generating form schemas' */
  description?: string
  /** Custom system prompt. If provided, replaces default prompt entirely. */
  systemPrompt?: string
  /** Component registry for schema validation. Default: elementPlusRegistry */
  registry?: ComponentPropsRegistry
}

/**
 * Local compatible interface for @ai-chat/vue's StructuredToolDefinition.
 * Defined locally because @ai-chat/vue doesn't export this type.
 */
export interface StructuredToolDefinition<T extends ZodType = ZodType> {
  name: string
  description: string
  schema: T
  execute: (input: z.infer<T>) => Promise<string>
}

/**
 * Return type of createFormAgent() factory.
 */
export interface FormAgentResult {
  agent: {
    id: string
    name: string
    description?: string
    systemPrompt: string
    isBuiltin?: boolean
    tools: StructuredToolDefinition[]
  }
  bus: FormAgentBus
}

// Re-export types for consumer convenience
export type { FormSchema, ComponentPropsRegistry } from '@d-form/shared'
