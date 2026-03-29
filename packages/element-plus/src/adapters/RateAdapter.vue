<template>
  <el-rate
    v-bind="componentProps"
    :model-value="modelValue"
    :disabled="disabled"
    :class="{ 'is-error': error }"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElRate } from 'element-plus'
import type { FieldSchema } from '@d-form/shared'

const props = defineProps<{
  name: string
  modelValue: number
  schema?: FieldSchema
  error?: string
  touched?: boolean
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: number]
  blur: []
}>()

const componentProps = computed(() => {
  const cp = { ...(props.schema?.componentProps ?? {}) }
  delete cp.modelValue
  delete cp['model-value']
  delete cp.disabled
  delete cp.class
  return cp
})
</script>
