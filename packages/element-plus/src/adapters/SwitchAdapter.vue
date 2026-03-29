<template>
  <el-switch
    :model-value="modelValue"
    :disabled="disabled"
    :active-text="activeText"
    :inactive-text="inactiveText"
    :class="{ 'is-error': error }"
    @update:model-value="$emit('update:modelValue', $event)"
    @blur="$emit('blur')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElSwitch } from 'element-plus'
import type { FieldSchema } from '@d-form/shared'

const props = defineProps<{
  name: string
  modelValue: boolean
  schema?: FieldSchema
  error?: string
  touched?: boolean
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  blur: []
}>()

const activeText = computed(
  () => (props.schema?.componentProps?.activeText ?? props.schema?.activeText) as string | undefined
)
const inactiveText = computed(
  () =>
    (props.schema?.componentProps?.inactiveText ?? props.schema?.inactiveText) as string | undefined
)
</script>
