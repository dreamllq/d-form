import { type ComponentPropsRegistry, type FormSchema, assembleFormSchema } from '@d-form/shared'
import type { z } from 'zod'
import type { FormAgentBus } from '../bus'
import type { StructuredToolDefinition } from '../types'

/**
 * Creates the generate_form_schema tool.
 * Validates input via assembleFormSchema, emits on bus, returns confirmation.
 */
export function createGenerateSchemaTool(
  registry: ComponentPropsRegistry,
  bus: FormAgentBus
): StructuredToolDefinition {
  const schema = assembleFormSchema(registry)

  return {
    name: 'generate_form_schema',
    description:
      'Generate or replace the entire form schema. This tool creates a complete FormSchema with fields, types, and component configurations. Each call replaces the previous schema entirely.',
    schema,
    execute: async (input) => {
      const result = schema.safeParse(input)

      if (!result.success) {
        const errors = result.error.issues
          .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
          .join('\n')
        return `Schema validation failed:\n${errors}\n\nPlease fix and try again.`
      }

      const data = result.data as { properties?: Record<string, unknown> }
      const fieldNames = Object.keys(data.properties || {})
      const fieldCount = fieldNames.length

      bus.emit('schema:change', result.data as z.infer<typeof FormSchema>)

      if (fieldCount === 0) {
        return 'Form schema generated successfully with 0 fields.'
      }

      const fieldList = fieldNames.join(', ')
      return `Form schema generated successfully with ${fieldCount} fields: ${fieldList}`
    },
  }
}
