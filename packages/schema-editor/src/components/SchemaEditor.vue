<script setup lang="ts">
import { computed, watch, toRef } from 'vue'
import { useSchemaSync } from '../composables/useSchemaSync'
import type { FormSchema } from '@d-form/shared'
import MonacoEditor from '@guolao/vue-monaco-editor'
import { DForm, DFormItems } from '@d-form/vue'
import generatedSchema from '../../dist/form-schema.json'

const props = defineProps<{
  schema: FormSchema
}>()

const emit = defineEmits<{
  'update:schema': [schema: FormSchema]
}>()

const schemaRef = toRef(() => props.schema)

const { activeTab, editorContent, parsedSchema, parseError, updateFromEditor, updateFromProp } =
  useSchemaSync(schemaRef)

// Watch schema prop changes → updateFromProp
watch(
  () => props.schema,
  (newSchema) => {
    updateFromProp(newSchema)
  }
)

// Watch parsedSchema changes → emit update:schema
watch(parsedSchema, (newParsed) => {
  if (newParsed) {
    emit('update:schema', newParsed)
  }
})

// Editor options
const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on' as const,
  automaticLayout: true,
  formatOnPaste: true,
  tabSize: 2,
}

// Monaco mount handler — configure JSON Schema validation
function onEditorMount(_editor: any, monaco: any) {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [
      {
        uri: 'http://d-form.dev/form-schema.json',
        fileMatch: ['*'],
        schema: generatedSchema,
      },
    ],
  })
}

// Force DForm re-render on schema changes
const schemaKey = computed(() => JSON.stringify(parsedSchema.value))
</script>

<template>
  <div class="schema-editor">
    <!-- Tab bar -->
    <div class="schema-editor__tabs">
      <button
        class="schema-editor__tab"
        :class="{ 'schema-editor__tab--active': activeTab === 'preview' }"
        @click="activeTab = 'preview'"
      >
        预览表单
      </button>
      <button
        class="schema-editor__tab"
        :class="{ 'schema-editor__tab--active': activeTab === 'editor' }"
        @click="activeTab = 'editor'"
      >
        编辑 Schema
      </button>
    </div>
    <!-- Preview panel -->
    <div v-show="activeTab === 'preview'" class="schema-editor__preview">
      <DForm v-if="parsedSchema" :schema="parsedSchema" :key="schemaKey">
        <DFormItems />
      </DForm>
      <div v-if="parseError" class="schema-editor__error">
        {{ parseError }}
      </div>
    </div>
    <!-- Editor panel -->
    <div v-show="activeTab === 'editor'" class="schema-editor__editor">
      <MonacoEditor
        :value="editorContent"
        @change="updateFromEditor"
        language="json"
        theme="vs"
        :options="editorOptions"
        @mount="onEditorMount"
      />
    </div>
  </div>
</template>

<style scoped>
.schema-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  box-sizing: border-box;
}

.schema-editor__tabs {
  display: flex;
  border-bottom: 1px solid #dcdfe6;
  background: #f5f7fa;
  flex-shrink: 0;
}

.schema-editor__tab {
  padding: 8px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition:
    color 0.2s,
    border-bottom-color 0.2s;
  border-bottom: 2px solid transparent;
}

.schema-editor__tab--active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.schema-editor__preview {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.schema-editor__editor {
  flex: 1;
  min-height: 0;
}

.schema-editor__error {
  padding: 8px 12px;
  margin-top: 8px;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 13px;
}
</style>
