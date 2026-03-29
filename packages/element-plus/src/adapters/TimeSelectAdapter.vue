<template>
  <el-time-select
    v-bind="componentProps"
    :model-value="modelValue"
    :disabled="disabled"
    :class="{ 'is-error': error }"
    @update:model-value="$emit('update:modelValue', $event)"
    @blur="$emit('blur')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElTimeSelect } from 'element-plus'
import type { FieldSchema } from '@d-form/shared'

const props = defineProps<{
  name: string
  modelValue: string | undefined
  schema?: FieldSchema
  error?: string
  touched?: boolean
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string | undefined]
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
