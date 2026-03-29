<template>
  <el-input
    v-bind="componentProps"
    type="textarea"
    :model-value="modelValue"
    :disabled="disabled"
    :rows="rows"
    :autosize="autosize"
    :show-word-limit="showWordLimit"
    :class="{ 'is-error': error }"
    @update:model-value="$emit('update:modelValue', $event)"
    @blur="$emit('blur')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElInput } from 'element-plus'
import type { FieldSchema } from '@d-form/shared'

const props = defineProps<{
  name: string
  modelValue: string
  schema?: FieldSchema
  error?: string
  touched?: boolean
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
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

const rows = computed(() => componentProps.value.rows ?? 2)
const autosize = computed(() => componentProps.value.autosize ?? false)
const showWordLimit = computed(() => componentProps.value.showWordLimit ?? false)
</script>
