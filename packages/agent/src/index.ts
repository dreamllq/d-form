// Factory
export { createFormAgent } from './create-form-agent'

// Bus class
export { FormAgentBus } from './bus'

// Re-export agent types for consumer convenience
export type { CreateFormAgentConfig, FormAgentResult, StructuredToolDefinition } from './types'

// Re-export shared types for consumer convenience
export type { FormSchema, ComponentPropsRegistry } from '@d-form/shared'
