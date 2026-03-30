import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { FormSchema } from '@d-form/shared'
import { parseSchema, schemaToJson } from './useSchemaParser'

export interface UseSchemaSyncReturn {
  /** Currently active tab ('preview' or 'editor') */
  activeTab: Ref<'preview' | 'editor'>
  /** Raw JSON string content of the editor */
  editorContent: Ref<string>
  /** Last successfully parsed schema (for preview rendering) */
  parsedSchema: ComputedRef<FormSchema | null>
  /** Current parse error message, or null */
  parseError: Ref<string | null>
  /** Whether the editor has unsaved/unparsed changes */
  isEditorDirty: Ref<boolean>
  /** Called when editor content changes (debounced internally) */
  updateFromEditor: (content: string) => void
  /** Called when the schema prop changes externally */
  updateFromProp: (schema: FormSchema | null | undefined) => void
}

export function useSchemaSync(schema: Ref<FormSchema>): UseSchemaSyncReturn {
  // State
  const activeTab = ref<'preview' | 'editor'>('preview')
  const editorContent = ref(schemaToJson(schema.value))
  const parseError = ref<string | null>(null)
  const isEditorDirty = ref(false)

  // Internal tracking of last valid schema
  const lastValidSchema = ref<FormSchema | null>(schema.value)

  // Computed: expose last valid parsed schema for preview
  const parsedSchema = computed<FormSchema | null>(() => lastValidSchema.value)

  // Debounce timer
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function updateFromEditor(content: string) {
    editorContent.value = content
    isEditorDirty.value = true

    // Clear previous debounce
    if (debounceTimer) clearTimeout(debounceTimer)

    debounceTimer = setTimeout(() => {
      const result = parseSchema(content)
      if (result.valid && result.schema) {
        lastValidSchema.value = result.schema
        parseError.value = null
      } else {
        parseError.value = result.error ?? 'Unknown parse error'
      }
      isEditorDirty.value = false
    }, 300)
  }

  function updateFromProp(newSchema: FormSchema | null | undefined) {
    const newJson = schemaToJson(newSchema)

    // Skip if the serialized content is semantically identical — avoids
    // a feedback loop: editor change → emit → prop change → overwrite editorContent → cursor reset
    const currentNormalized = JSON.stringify(JSON.parse(editorContent.value || '{}'))
    const newNormalized = JSON.stringify(JSON.parse(newJson || '{}'))
    if (currentNormalized === newNormalized) return

    editorContent.value = newJson
    if (newSchema) {
      lastValidSchema.value = newSchema
    }
    parseError.value = null
  }

  return {
    activeTab,
    editorContent,
    parsedSchema,
    parseError,
    isEditorDirty,
    updateFromEditor,
    updateFromProp,
  }
}
