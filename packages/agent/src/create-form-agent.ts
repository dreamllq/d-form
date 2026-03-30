import { elementPlusRegistry } from '@d-form/element-plus'
import { FormAgentBus } from './bus'
import { createGenerateSchemaTool } from './tools/generate-schema'
import { buildSystemPrompt } from './prompts'
import type { CreateFormAgentConfig, FormAgentResult } from './types'

/**
 * Creates a form schema generation agent compatible with @ai-chat/vue.
 * Returns { agent, bus } where agent is the agent definition and bus
 * is the typed event bus for receiving schema changes.
 */
export function createFormAgent(config: CreateFormAgentConfig = {}): FormAgentResult {
  const registry = config.registry ?? elementPlusRegistry
  const bus = new FormAgentBus()
  const tool = createGenerateSchemaTool(registry, bus)
  const systemPrompt = buildSystemPrompt(registry, config.systemPrompt)

  return {
    agent: {
      id: config.id ?? 'd-form-agent',
      name: config.name ?? 'D-Form Agent',
      description: config.description ?? 'AI agent for generating form schemas',
      systemPrompt,
      tools: [tool],
    },
    bus,
  }
}
