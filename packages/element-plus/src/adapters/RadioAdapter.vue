<template>
  <el-radio-group
    :model-value="modelValue"
    :disabled="disabled"
    :class="{ 'is-error': error }"
    @update:model-value="$emit('update:modelValue', $event)"
    @blur="$emit('blur')"
  >
    <el-radio
      v-for="option in options"
      :key="option.value"
      :label="option.value"
      :disabled="option.disabled"
    >
      {{ option.label }}
    </el-radio>
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

const options = computed<RadioOption[]>(() => {
  const cp = props.schema?.componentProps
  return ((cp?.options ?? props.schema?.options) as RadioOption[]) || []
})
</script>
