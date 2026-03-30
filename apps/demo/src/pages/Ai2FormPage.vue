<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { AiChat } from '@ai-chat/vue'
import { SchemaEditor } from '@d-form/schema-editor'
import { createFormAgent } from '@d-form/agent'
import { registerAgent } from '@ai-chat/vue'
import type { FormSchema } from '@d-form/shared'

const { agent, bus } = createFormAgent()
registerAgent(agent)

const schema = ref<FormSchema>({ type: 'object', properties: {} })

const handleSchemaChange = (newSchema: FormSchema) => {
  schema.value = newSchema
}

const unsubscribe = bus.on('schema:change', handleSchemaChange)

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
