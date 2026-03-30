import type { ComponentPropsRegistry } from '@d-form/shared'

/**
 * Builds the system prompt for the form schema generation agent.
 * If customPrompt is provided, returns it as-is (no merging).
 * Otherwise generates a default prompt with component catalog and example.
 */
export function buildSystemPrompt(registry: ComponentPropsRegistry, customPrompt?: string): string {
  if (customPrompt) {
    return customPrompt
  }

  const componentNames = Object.keys(registry)
  const hasComponents = componentNames.length > 0

  const sections: string[] = [
    'You are a form schema generation assistant. Your role is to help users create and modify form schemas by generating valid FormSchema data structures.',
    '',
    'Use the `generate_form_schema` tool to create or replace the entire form schema. Each call replaces the previous schema completely.',
  ]

  if (hasComponents) {
    sections.push('')
    sections.push('Available components:')
    for (const name of componentNames) {
      sections.push(`  - ${name}`)
    }
  }

  sections.push('')
  sections.push('FormSchema structure:')
  sections.push('```json')
  sections.push('{')
  sections.push('  "type": "object",')
  sections.push('  "properties": {')
  sections.push('    "fieldName": {')
  sections.push('      "type": "string",')
  sections.push('      "component": "input",')
  sections.push('      "title": "Field Label",')
  sections.push('      "componentProps": { "placeholder": "Enter value" }')
  sections.push('    }')
  sections.push('  }')
  sections.push('}')
  sections.push('```')

  sections.push('')
  sections.push('Common field types: string, number, boolean, object, array.')
  sections.push('The "component" field must be one of the available components listed above.')
  sections.push('The "componentProps" field accepts component-specific configuration.')

  return sections.join('\n')
}
