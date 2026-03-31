<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { AiChat, useSession } from '@ai-chat/vue'
import { SchemaEditor } from '@d-form/schema-editor'
import { createFormAgent } from '@d-form/agent'
import { registerAgent } from '@ai-chat/vue'
import type { FormSchema } from '@d-form/shared'

const { agent, bus } = createFormAgent()
registerAgent(agent)

const { currentConversationId } = useSession()

// localStorage helpers
const getStorageKey = (id: string) => `d-form:schema:${id}`

const saveSchema = (id: string, s: FormSchema) => {
  try {
    localStorage.setItem(getStorageKey(id), JSON.stringify(s))
  } catch {
    console.warn('Failed to save schema to localStorage')
  }
}

const loadSchema = (id: string): FormSchema | null => {
  try {
    const stored = localStorage.getItem(getStorageKey(id))
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// Initialize schema with localStorage recovery
const initial = currentConversationId.value
  ? (loadSchema(currentConversationId.value) ?? { type: 'object' as const, properties: {} })
  : { type: 'object' as const, properties: {} }
const schema = ref<FormSchema>(initial)

// Bus event: Agent → schema
const unsubscribe = bus.on('schema:change', (s) => {
  schema.value = s
})

// Session switch: save old, load new
watch(currentConversationId, (newId, oldId) => {
  if (oldId) saveSchema(oldId, schema.value)
  if (newId) {
    const loaded = loadSchema(newId)
    schema.value = loaded ?? { type: 'object', properties: {} }
  }
})

// Auto-persist + bus sync on every schema change
watch(
  schema,
  (s) => {
    if (currentConversationId.value) saveSchema(currentConversationId.value, s)
    bus.setCurrentSchema(s)
  },
  { deep: true }
)

onUnmounted(() => {
  unsubscribe()
})
</script>

<template>
  <div class="ai2form-page">
    <div class="ai2form-left">
      <AiChat locale="zh-cn" />
    </div>
    <div class="ai2form-right">
      <SchemaEditor :schema="schema" @update:schema="(s: any) => (schema = s)" />
    </div>
  </div>
</template>

<style scoped>
.ai2form-page {
  display: flex;
  height: calc(100vh - 60px - 48px);
  gap: 16px;
}

.ai2form-left {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.ai2form-right {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}
</style>
