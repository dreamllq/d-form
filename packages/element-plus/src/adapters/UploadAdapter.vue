<template>
  <el-upload
    v-bind="componentProps"
    :file-list="modelValue"
    :disabled="disabled"
    :class="{ 'is-error': error }"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElUpload } from 'element-plus'
import type { UploadFile } from 'element-plus'
import type { FieldSchema } from '@d-form/shared'

const props = defineProps<{
  name: string
  modelValue: UploadFile[]
  schema?: FieldSchema
  error?: string
  touched?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UploadFile[]]
}>()

const componentProps = computed(() => {
  const cp = { ...(props.schema?.componentProps ?? {}) }
  delete cp.modelValue
  delete cp['model-value']
  delete cp.disabled
  delete cp.class
  delete cp.fileList
  delete cp['file-list']
  return cp
})

function handleChange(uploadFile: UploadFile, uploadFiles: UploadFile[]) {
  emit('update:modelValue', uploadFiles)
}
</script>
