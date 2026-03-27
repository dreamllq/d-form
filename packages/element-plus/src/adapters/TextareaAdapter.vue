<template>
  <el-input
    type="textarea"
    :model-value="modelValue"
    :disabled="disabled"
    :placeholder="placeholder"
    :rows="rows"
    :autosize="autosize"
    :maxlength="maxlength"
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
  'blur': []
}>()

const placeholder = computed(() => props.schema?.placeholder)
const rows = computed(() => (props.schema?.rows as number) || 2)
const autosize = computed(() => props.schema?.autosize ?? false)
const maxlength = computed(() => props.schema?.maxlength as number | undefined)
const showWordLimit = computed(() => props.schema?.showWordLimit ?? false)
</script>
