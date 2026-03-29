<template>
  <el-radio-group
    v-bind="componentProps"
    :model-value="modelValue"
    :disabled="disabled"
    :class="{ 'is-error': error }"
    @update:model-value="$emit('update:modelValue', $event)"
    @blur="$emit('blur')"
  >
    <el-radio
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :label="option.label"
      :disabled="option.disabled"
    />
  </el-radio-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElRadioGroup, ElRadio } from 'element-plus'
import type { FieldSchema } from '@d-form/shared'

interface RadioOption {
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

const componentProps = computed(() => {
  const cp = { ...(props.schema?.componentProps ?? {}) }
  delete cp.modelValue
  delete cp['model-value']
  delete cp.disabled
  delete cp.class
  return cp
})

const options = computed<RadioOption[]>(() => {
  return (componentProps.value.options as RadioOption[]) || []
})
</script>
