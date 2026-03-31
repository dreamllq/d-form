import { z } from 'zod'
import type { FormAgentBus } from '../bus'
import type { StructuredToolDefinition } from '../types'

/**
 * Creates the get_current_schema tool.
 * Pure read tool — returns the current form schema or a message if none exists.
 */
export function createGetCurrentSchemaTool(bus: FormAgentBus): StructuredToolDefinition {
  return {
    name: 'get_current_schema',
    description:
      'Read the current form schema. Use this tool before modifying the schema to understand what fields already exist. Returns the current schema JSON or a message if no schema exists yet.',
    schema: z.object({}),
    execute: async () => {
      const schema = bus.getCurrentSchema()

      if (schema === null) {
        return 'No form schema exists yet. Generate a new schema using generate_form_schema.'
      }

      const properties = (schema as { properties?: Record<string, unknown> }).properties || {}
      const fieldNames = Object.keys(properties)
      const fieldCount = fieldNames.length

      const json = JSON.stringify(schema, null, 2)
      return `${json}\n\nCurrent schema has ${fieldCount} fields: ${fieldNames.join(', ')}`
    },
  }
}
