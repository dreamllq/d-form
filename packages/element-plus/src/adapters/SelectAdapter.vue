<template>
  <el-select
    v-bind="componentProps"
    :model-value="modelValue"
    :disabled="disabled"
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
  modelValue: string | number | (string | number)[] | undefined
  schema?: FieldSchema
  error?: string
  touched?: boolean
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[] | undefined]
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
const options = computed<SelectOption[]>(() => {
  return (componentProps.value.options as SelectOption[]) || []
})
</script>
