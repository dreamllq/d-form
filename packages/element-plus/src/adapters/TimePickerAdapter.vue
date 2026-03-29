<template>
  <el-time-picker
    v-bind="componentProps"
    :model-value="modelValue"
    :disabled="disabled"
    :clearable="clearable"
    :class="{ 'is-error': error }"
    @update:model-value="$emit('update:modelValue', $event)"
    @blur="$emit('blur')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElTimePicker } from 'element-plus'
import type { FieldSchema } from '@d-form/shared'

const props = defineProps<{
  name: string
  modelValue: string | Date | undefined
  schema?: FieldSchema
  error?: string
  touched?: boolean
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string | Date | undefined]
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

const clearable = computed(() => componentProps.value.clearable ?? true)
</script>
