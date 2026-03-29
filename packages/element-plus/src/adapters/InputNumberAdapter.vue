<template>
  <el-input-number
    :model-value="modelValue"
    :disabled="disabled"
    :placeholder="placeholder"
    :min="min"
    :max="max"
    :step="step"
    :precision="precision"
    :controls="controls"
    :class="{ 'is-error': error }"
    @update:model-value="$emit('update:modelValue', $event)"
    @blur="$emit('blur')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElInputNumber } from 'element-plus'
import type { FieldSchema } from '@d-form/shared'

const props = defineProps<{
  name: string
  modelValue: number | undefined
  schema?: FieldSchema
  error?: string
  touched?: boolean
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: number | undefined]
  blur: []
}>()

const placeholder = computed(() => props.schema?.placeholder)
const min = computed(
  () => (props.schema?.componentProps?.min ?? props.schema?.min) as number | undefined
)
const max = computed(
  () => (props.schema?.componentProps?.max ?? props.schema?.max) as number | undefined
)
const step = computed(
  () => (props.schema?.componentProps?.step ?? props.schema?.step) as number | undefined
)
const precision = computed(
  () => (props.schema?.componentProps?.precision ?? props.schema?.precision) as number | undefined
)
const controls = computed(
  () => props.schema?.componentProps?.controls ?? props.schema?.controls ?? true
)
</script>
