import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { createFormAgent } from '../create-form-agent'
import { FormAgentBus } from '../bus'

describe('createFormAgent', () => {
  it('returns object with { agent, bus } shape', () => {
    const result = createFormAgent()
    expect(result).toHaveProperty('agent')
    expect(result).toHaveProperty('bus')
    expect(result.bus).toBeInstanceOf(FormAgentBus)
  })

  it('default config: agent.id is "d-form-agent"', () => {
    const { agent } = createFormAgent()
    expect(agent.id).toBe('d-form-agent')
  })

  it('default config: agent.name is "D-Form Agent"', () => {
    const { agent } = createFormAgent()
    expect(agent.name).toBe('D-Form Agent')
  })

  it('default config: agent.tools has exactly 2 tools', () => {
    const { agent } = createFormAgent()
    expect(agent.tools).toHaveLength(2)
  })

  it('default config: agent.tools[0].name is "generate_form_schema"', () => {
    const { agent } = createFormAgent()
    expect(agent.tools[0].name).toBe('generate_form_schema')
  })

  it('default config: agent.tools[1].name is "get_current_schema"', () => {
    const { agent } = createFormAgent()
    expect(agent.tools[1].name).toBe('get_current_schema')
  })

  it('default config: agent.systemPrompt is a non-empty string containing component names', () => {
    const { agent } = createFormAgent()
    expect(typeof agent.systemPrompt).toBe('string')
    expect(agent.systemPrompt.length).toBeGreaterThan(0)
    expect(agent.systemPrompt).toContain('input')
    expect(agent.systemPrompt).toContain('select')
  })

  it('custom id: agent.id matches config', () => {
    const { agent } = createFormAgent({ id: 'my-agent' })
    expect(agent.id).toBe('my-agent')
  })

  it('custom name: agent.name matches config', () => {
    const { agent } = createFormAgent({ name: 'My Agent' })
    expect(agent.name).toBe('My Agent')
  })

  it('custom systemPrompt: replaces default completely', () => {
    const customPrompt = 'Custom prompt content here.'
    const { agent } = createFormAgent({ systemPrompt: customPrompt })
    expect(agent.systemPrompt).toBe(customPrompt)
  })

  it('custom registry: tool schema reflects custom registry', () => {
    const customRegistry = {
      customInput: z.object({ placeholder: z.string().optional() }),
    }
    const { agent } = createFormAgent({ registry: customRegistry })
    expect(agent.tools[0].name).toBe('generate_form_schema')
  })

  it('multiple calls create independent bus instances', () => {
    const a = createFormAgent()
    const b = createFormAgent()
    expect(a.bus).not.toBe(b.bus)
  })

  it('agent has description property', () => {
    const { agent } = createFormAgent()
    expect(agent.description).toBeDefined()
    expect(typeof agent.description).toBe('string')
  })

  it('custom description: agent.description matches config', () => {
    const { agent } = createFormAgent({ description: 'Custom desc' })
    expect(agent.description).toBe('Custom desc')
  })

  it('default config: uses elementPlusRegistry when no registry provided', () => {
    const { agent } = createFormAgent()
    // The system prompt should list element-plus components
    expect(agent.systemPrompt).toContain('input')
    expect(agent.systemPrompt).toContain('select')
    expect(agent.systemPrompt).toContain('checkbox')
  })

  it('tool execute returns string result', async () => {
    const { agent } = createFormAgent()
    const tool = agent.tools[0]
    const result = await tool.execute({
      type: 'object',
      properties: {},
    })
    expect(typeof result).toBe('string')
    expect(result).toContain('0 fields')
  })
})
