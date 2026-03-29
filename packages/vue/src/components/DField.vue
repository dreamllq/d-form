<script setup lang="ts">
import { computed, inject, type Component } from 'vue'
import { useField } from '../composables/useField'
import type { FieldSchema } from '@d-form/shared'

const props = defineProps<{
  name: string
  schema?: FieldSchema
  component?: string | Component
  disabled?: boolean
}>()

const formContext = inject<any>('d-form')

const {
  value,
  error,
  touched,
  disabled: fieldDisabled,
  setValue,
  setTouched,
  validate,
} = useField(props.name, formContext?.form, { schema: props.schema })

const fieldValue = computed({
  get: () => value.value,
  set: (val) => setValue(val),
})

const fieldError = computed(() => error.value)

const effectiveDisabled = computed(() => {
  return fieldDisabled.value ?? props.schema?.disabled ?? false
})

const renderComponent = computed(() => {
  if (typeof props.component === 'object') {
    return props.component
  }
  const componentName = props.component || props.schema?.component || 'input'
  return formContext?.getComponent?.(componentName) || componentName
})

const handleBlur = () => {
  setTouched(true)
}

defineExpose({
  validate,
  value,
  error,
  touched,
})
</script>

<template>
  <component
    :is="renderComponent"
    v-model="fieldValue"
    :name="name"
    :error="fieldError"
    :touched="touched"
    :disabled="effectiveDisabled"
    :schema="schema"
    @blur="handleBlur"
  />
</template>
