<template>
  <el-date-picker
    :model-value="modelValue"
    :disabled="disabled"
    :placeholder="placeholder"
    :type="dateType"
    :format="format"
    :value-format="valueFormat"
    :clearable="clearable"
    :class="{ 'is-error': error }"
    @update:model-value="$emit('update:modelValue', $event)"
    @blur="$emit('blur')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElDatePicker } from 'element-plus'
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

const placeholder = computed(() => props.schema?.placeholder)
const clearable = computed(
  () => props.schema?.componentProps?.clearable ?? props.schema?.clearable ?? true
)
const dateType = computed(
  () => ((props.schema?.componentProps?.dateType ?? props.schema?.dateType) as string) || 'date'
)
const format = computed(
  () => (props.schema?.componentProps?.format ?? props.schema?.format) as string | undefined
)
const valueFormat = computed(
  () =>
    (props.schema?.componentProps?.valueFormat ?? props.schema?.valueFormat) as string | undefined
)
</script>
