<template>
  <el-checkbox-group
    v-bind="componentProps"
    :model-value="modelValue"
    :disabled="disabled"
    :class="{ 'is-error': error }"
    @update:model-value="$emit('update:modelValue', $event)"
    @blur="$emit('blur')"
  >
    <el-checkbox
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :label="option.label"
      :disabled="option.disabled"
    />
  </el-checkbox-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElCheckboxGroup, ElCheckbox } from 'element-plus'
import type { FieldSchema } from '@d-form/shared'

interface CheckboxOption {
  label: string
  value: string | number
  disabled?: boolean
}

const props = defineProps<{
  name: string
  modelValue: (string | number)[]
  schema?: FieldSchema
  error?: string
  touched?: boolean
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: (string | number)[]]
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

const options = computed<CheckboxOption[]>(() => {
  return (componentProps.value.options as CheckboxOption[]) || []
})
</script>
