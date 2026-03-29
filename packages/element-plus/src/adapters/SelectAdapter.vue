<template>
  <el-select
    :model-value="modelValue"
    :disabled="disabled"
    :placeholder="placeholder"
    :clearable="clearable"
    :class="{ 'is-error': error }"
    @update:model-value="$emit('update:modelValue', $event)"
    @blur="$emit('blur')"
  >
    <el-option
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
      :disabled="option.disabled"
    />
  </el-select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElSelect, ElOption } from 'element-plus'
import type { FieldSchema } from '@d-form/shared'

interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

const props = defineProps<{
  name: string
  modelValue: string | number | undefined
  schema?: FieldSchema
  error?: string
  touched?: boolean
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string | number | undefined]
  blur: []
}>()

const placeholder = computed(() => props.schema?.placeholder)
const clearable = computed(
  () => props.schema?.componentProps?.clearable ?? props.schema?.clearable ?? true
)
const options = computed<SelectOption[]>(() => {
  const cp = props.schema?.componentProps
  return ((cp?.options ?? props.schema?.options) as SelectOption[]) || []
})
</script>
