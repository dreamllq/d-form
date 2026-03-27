<template>
  <div class="page">
    <h2 class="page-title">Schema Editor</h2>
    <p class="page-desc">Edit JSON schema and see live form preview</p>

    <div class="editor-layout">
      <div class="editor-panel">
        <div class="panel-header">
          <h3>JSON Schema</h3>
          <el-button size="small" type="primary" @click="applySchema">Apply</el-button>
        </div>
        <textarea v-model="schemaText" class="schema-textarea" spellcheck="false" />
        <div v-if="parseError" class="parse-error">{{ parseError }}</div>
      </div>

      <div class="preview-panel">
        <div class="panel-header">
          <h3>Live Preview</h3>
        </div>
        <div class="preview-content">
          <DForm
            v-if="liveSchema"
            :schema="liveSchema"
            :initial-values="liveInitialValues"
            @submit="handlePreviewSubmit"
          >
            <div class="preview-fields">
              <div v-for="(_, key) in liveSchema.properties" :key="key" class="field-row">
                <label class="field-label">{{
                  (liveSchema.properties[key] as any)?.title || key
                }}</label>
                <DField :name="key as string" :schema="liveSchema.properties[key as string]" />
              </div>
            </div>
            <el-button type="primary" native-type="submit" size="small">Submit</el-button>
          </DForm>
          <div v-else class="empty-state">Edit and apply a schema to see the preview</div>

          <div v-if="previewValues" class="result-card">
            <h4>Submitted</h4>
            <pre>{{ JSON.stringify(previewValues, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DForm, DField } from '@d-form/vue'
import type { FormSchema } from '@d-form/shared'
import { ElButton } from 'element-plus'

const defaultSchema: FormSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', component: 'input', title: 'Name', placeholder: 'Your name' },
    email: { type: 'string', component: 'input', title: 'Email', placeholder: 'your@email.com' },
    role: {
      type: 'string',
      component: 'select',
      title: 'Role',
      componentProps: {
        options: [
          { label: 'Developer', value: 'dev' },
          { label: 'Designer', value: 'design' },
          { label: 'Manager', value: 'pm' },
        ],
      },
    },
    active: { type: 'boolean', component: 'switch', title: 'Active' },
  },
}

const schemaText = ref(JSON.stringify(defaultSchema, null, 2))
const liveSchema = ref<FormSchema>({ ...defaultSchema })
const parseError = ref('')
const previewValues = ref<Record<string, any> | null>(null)

const liveInitialValues = computed(() => {
  if (!liveSchema.value?.properties) return {}
  const vals: Record<string, any> = {}
  for (const [key, field] of Object.entries(liveSchema.value.properties)) {
    if (field.type === 'boolean') vals[key] = false
    else if (field.type === 'number') vals[key] = 0
    else vals[key] = ''
  }
  return vals
})

const applySchema = () => {
  parseError.value = ''
  try {
    const parsed = JSON.parse(schemaText.value)
    if (!parsed.type || !parsed.properties) {
      parseError.value = 'Schema must have "type" and "properties" fields'
      return
    }
    liveSchema.value = parsed
  } catch (e: any) {
    parseError.value = `Invalid JSON: ${e.message}`
  }
}

const handlePreviewSubmit = (values: any) => {
  previewValues.value = values
}
</script>

<style scoped>
.page {
  max-width: 1200px;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #303133;
}
.page-desc {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
}

.editor-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.editor-panel,
.preview-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}

.panel-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.schema-textarea {
  width: 100%;
  min-height: 400px;
  padding: 16px;
  border: none;
  outline: none;
  resize: vertical;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #303133;
  background: #fafbfc;
}

.parse-error {
  padding: 8px 16px;
  background: #fef0f0;
  color: #f56c6c;
  font-size: 12px;
  border-top: 1px solid #fde2e2;
}

.preview-content {
  padding: 20px;
}

.preview-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #909399;
  font-size: 14px;
}

.result-card {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.result-card h4 {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.result-card pre {
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}
</style>
