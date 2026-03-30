import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '../prompts'
import { elementPlusRegistry } from '@d-form/element-plus'

describe('buildSystemPrompt', () => {
  it('default prompt contains all registry component names', () => {
    const prompt = buildSystemPrompt(elementPlusRegistry)

    const components = [
      'input',
      'select',
      'date-picker',
      'checkbox',
      'radio',
      'switch',
      'input-number',
      'textarea',
      'time-picker',
      'time-select',
      'cascader',
      'slider',
      'rate',
      'color-picker',
      'tree-select',
      'autocomplete',
      'checkbox-group',
      'upload',
    ]

    for (const component of components) {
      expect(prompt).toContain(component)
    }
  })

  it('default prompt explains the agent purpose', () => {
    const prompt = buildSystemPrompt(elementPlusRegistry)

    expect(prompt).toContain('form schema')
    expect(prompt.toLowerCase()).toContain('generate')
  })

  it('default prompt includes example FormSchema structure', () => {
    const prompt = buildSystemPrompt(elementPlusRegistry)

    expect(prompt).toContain('type')
    expect(prompt).toContain('properties')
    expect(prompt).toContain('component')
  })

  it('custom systemPrompt replaces default entirely (no merging)', () => {
    const customPrompt = 'My completely custom prompt for testing purposes.'
    const result = buildSystemPrompt(elementPlusRegistry, customPrompt)

    expect(result).toBe(customPrompt)
  })

  it('empty registry still produces a valid prompt', () => {
    const emptyRegistry = {}
    const prompt = buildSystemPrompt(emptyRegistry)

    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
    expect(prompt).toContain('form schema')
  })
})
