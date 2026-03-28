<script setup lang="ts">
import { computed, inject } from 'vue'
import DFormItem from './DFormItem.vue'
import type { FieldSchema, FormSchema } from '@d-form/shared'

const formContext = inject<any>('d-form')
const schema = computed(() => formContext?.schema as FormSchema | undefined)

const fields = computed(() => {
  const properties = schema.value?.properties
  if (!properties) return {}
  // Filter out void type fields (non-data fields like dividers)
  const filtered: Record<string, FieldSchema> = {}
  for (const [key, fieldSchema] of Object.entries(properties)) {
    if (fieldSchema.type !== 'void') {
      filtered[key] = fieldSchema
    }
  }
  return filtered
})
</script>

<template>
  <DFormItem
    v-for="(fieldSchema, key) in fields"
    :key="key"
    :name="String(key)"
    :schema="fieldSchema"
  />
</template>
