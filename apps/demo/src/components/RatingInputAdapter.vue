<template>
  <div :class="{ 'is-error': touched && error }">
    <h4 v-if="componentProps.label">{{ componentProps.label }}</h4>
    <el-rate
      v-bind="rateProps"
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="$emit('update:modelValue', $event)"
      @blur="$emit('blur')"
    />
    <p v-if="componentProps.description" class="rating-description">
      {{ componentProps.description }}
    </p>
    <div v-if="touched && error" class="rating-error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElRate } from 'element-plus'
import type { FieldSchema } from '@d-form/shared'

const props = defineProps<{
  name: string
  modelValue: number
  schema?: FieldSchema
  error?: string
  touched?: boolean
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: number]
  blur: []
}>()

const componentProps = computed(() => {
  const cp = { ...(props.schema?.componentProps ?? {}) }
  return {
    max: cp.max as number | undefined,
    allowHalf: cp.allowHalf as boolean | undefined,
    showScore: cp.showScore as boolean | undefined,
    label: cp.label as string | undefined,
    description: cp.description as string | undefined,
  }
})

const rateProps = computed(() => {
  const result: Record<string, unknown> = {}
  if (componentProps.value.max !== undefined) result.max = componentProps.value.max
  if (componentProps.value.allowHalf !== undefined)
    result.allowHalf = componentProps.value.allowHalf
  if (componentProps.value.showScore !== undefined)
    result.showScore = componentProps.value.showScore
  return result
})
</script>

<style scoped>
.rating-description {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.rating-error {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 4px;
}

.is-error :deep(.el-rate) {
  --el-rate-fill-color: #f56c6c;
}
</style>
