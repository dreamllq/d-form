/**
 * Build-time script that writes a hand-written JSON Schema (draft-07)
 * for the FormSchema / FieldSchema type family.
 *
 * ts-json-schema-generator was tested but crashes on the `z.infer<…>`
 * call expressions used throughout the codebase, so we maintain this
 * schema manually and keep it in sync with the TypeScript types in
 * @d-form/shared.
 *
 * Usage:  tsx scripts/generate-schema.ts
 * Output: dist/form-schema.json
 */

import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// Hand-written JSON Schema — mirrors the TS types in @d-form/shared
// ---------------------------------------------------------------------------

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://d-form.dev/schemas/form-schema.json',
  title: 'FormSchema',
  description:
    'JSON Schema for the d-form FormSchema type. ' +
    'Keep in sync with packages/shared/src/types/{form,field,reaction,validation,grid}.ts',

  definitions: {
    // ---- Field types -------------------------------------------------------

    FieldType: {
      type: 'string',
      enum: ['string', 'number', 'boolean', 'object', 'array', 'date', 'void'],
      description: 'Built-in field type names. Custom strings are also allowed.',
    },

    LabelPosition: {
      type: 'string',
      enum: ['left', 'right', 'top'],
    },

    LabelWidth: {
      oneOf: [{ type: 'string' }, { type: 'number' }],
      description: "Label width, e.g. '100px' or 100.",
    },

    // ---- Validation --------------------------------------------------------

    ValidationTrigger: {
      type: 'string',
      enum: ['blur', 'change'],
    },

    ValidationRule: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['required', 'min', 'max', 'minLength', 'maxLength', 'pattern', 'custom'],
        },
        value: {},
        message: { type: 'string' },
        validator: {},
        trigger: {
          oneOf: [
            { $ref: '#/definitions/ValidationTrigger' },
            {
              type: 'array',
              items: { $ref: '#/definitions/ValidationTrigger' },
            },
          ],
        },
      },
      required: ['type'],
      additionalProperties: false,
    },

    ValidationConfig: {
      type: 'object',
      properties: {
        rules: {
          type: 'array',
          items: { $ref: '#/definitions/ValidationRule' },
        },
        validator: { type: 'string' },
        trigger: {
          oneOf: [
            {
              type: 'string',
              enum: ['blur', 'change', 'submit'],
            },
            {
              type: 'array',
              items: {
                type: 'string',
                enum: ['blur', 'change', 'submit'],
              },
            },
          ],
        },
        validateVisibleOnly: { type: 'boolean' },
      },
      additionalProperties: false,
    },

    // ---- Reactions ---------------------------------------------------------

    FieldState: {
      type: 'object',
      properties: {
        value: {},
        error: { type: 'string' },
        touched: { type: 'boolean' },
        dirty: { type: 'boolean' },
        visible: { type: 'boolean' },
        disabled: { type: 'boolean' },
        validating: { type: 'boolean' },
        loading: { type: 'boolean' },
        displayValue: {},
      },
      required: ['value', 'touched', 'dirty', 'visible', 'disabled', 'validating'],
      additionalProperties: false,
    },

    ReactionEffect: {
      type: 'object',
      properties: {
        state: { $ref: '#/definitions/FieldState' },
        schema: { $ref: '#/definitions/FieldSchema' },
        run: { type: 'string' },
      },
      additionalProperties: false,
    },

    ReactionConfig: {
      type: 'object',
      properties: {
        dependencies: {
          type: 'array',
          items: { type: 'string' },
        },
        target: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
        },
        when: { type: 'string' },
        fulfill: { $ref: '#/definitions/ReactionEffect' },
        otherwise: { $ref: '#/definitions/ReactionEffect' },
      },
      additionalProperties: false,
    },

    ReactionSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['linkage', 'effect', 'computed'],
        },
        dependencies: {
          type: 'array',
          items: { type: 'string' },
        },
        target: {
          oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
        },
        when: { type: 'string' },
        fulfill: { $ref: '#/definitions/ReactionEffect' },
        otherwise: { $ref: '#/definitions/ReactionEffect' },
        expression: { type: 'string' },
        executor: { type: 'string' },
      },
      additionalProperties: false,
    },

    // ---- Grid --------------------------------------------------------------

    GridConfig: {
      type: 'object',
      properties: {
        maxColumns: { type: 'number' },
        minColumns: { type: 'number' },
        minColumnWidth: { type: 'number' },
        maxColumnWidth: { type: 'number' },
        columnGap: { type: 'number' },
        rowGap: { type: 'number' },
        colWrap: { type: 'boolean' },
      },
      additionalProperties: false,
    },

    // ---- UI ----------------------------------------------------------------

    UISchema: {
      type: 'object',
      properties: {
        layout: {
          type: 'string',
          enum: ['vertical', 'inline'],
        },
        labelWidth: {
          oneOf: [{ type: 'string' }, { type: 'number' }],
        },
        gutter: { type: 'number' },
        columns: { type: 'number' },
        size: {
          type: 'string',
          enum: ['small', 'default', 'large'],
        },
        labelPosition: { $ref: '#/definitions/LabelPosition' },
        colon: { type: 'boolean' },
        showRequiredAsterisk: { type: 'boolean' },
        grid: { $ref: '#/definitions/GridConfig' },
        minColumns: { type: 'number' },
      },
      additionalProperties: false,
    },

    // ---- FieldSchema (recursive) -------------------------------------------

    FieldSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description:
            'Field type. Built-in values: string, number, boolean, object, array, date, void. ' +
            'Custom strings allowed for custom components.',
        },
        key: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        default: {},
        component: {
          type: 'string',
          description: 'Component name to render (resolved via renderer registry).',
        },
        componentProps: {
          type: 'object',
          additionalProperties: {},
        },
        validation: { $ref: '#/definitions/ValidationConfig' },
        reactions: {
          type: 'array',
          items: { $ref: '#/definitions/ReactionConfig' },
        },
        visible: { type: 'boolean' },
        disabled: { type: 'boolean' },
        placeholder: { type: 'string' },
        labelPosition: { $ref: '#/definitions/LabelPosition' },
        labelWidth: { $ref: '#/definitions/LabelWidth' },
        required: { type: 'boolean' },
        enum: {
          type: 'array',
          items: {},
        },
        properties: {
          type: 'object',
          additionalProperties: { $ref: '#/definitions/FieldSchema' },
        },
        items: { $ref: '#/definitions/FieldSchema' },
      },
      required: ['type'],
      additionalProperties: false,
    },
  },

  // ---- FormSchema (root) ---------------------------------------------------

  type: 'object',
  properties: {
    type: {
      type: 'string',
      const: 'object',
      description: "Schema type — always 'object' for forms.",
    },
    properties: {
      type: 'object',
      additionalProperties: { $ref: '#/definitions/FieldSchema' },
      description: 'Form field schemas keyed by field name.',
    },
    uiSchema: { $ref: '#/definitions/UISchema' },
    reactions: {
      type: 'array',
      items: { $ref: '#/definitions/ReactionSchema' },
    },
    title: { type: 'string' },
    description: { type: 'string' },
    default: {
      type: 'object',
      additionalProperties: {},
    },
    scope: {
      type: 'object',
      additionalProperties: {},
      description:
        'Expression scope — variables available inside {{}} expressions. ' +
        'e.g. { cityMap } lets reactions reference {{cityMap[$deps[0]]}}',
    },
  },
  required: ['type', 'properties'],
  additionalProperties: false,
} as const

// ---------------------------------------------------------------------------
// Write to dist/form-schema.json
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const outDir = resolve(__dirname, '..', 'dist')
const outFile = resolve(outDir, 'form-schema.json')

mkdirSync(outDir, { recursive: true })
writeFileSync(outFile, JSON.stringify(schema, null, 2) + '\n', 'utf-8')

console.log(`✓ JSON Schema written to ${outFile}`)
console.log(`  $schema: ${schema.$schema}`)
console.log(`  definitions: ${Object.keys(schema.definitions).join(', ')}`)
