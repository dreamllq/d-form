<script setup lang="ts">
import { provide, reactive, computed } from 'vue'
import { useForm } from '../composables/useForm'
import { createFormContext } from '../renderer'
import DFormItems from './DFormItems.vue'
import type { FormSchema } from '@d-form/shared'

const props = defineProps<{
  schema?: FormSchema
  initialValues?: Record<string, any>
  onSubmit?: (values: any) => Promise<void> | void
  labelPosition?: 'left' | 'right' | 'top'
  labelWidth?: string | number
  layout?: 'vertical' | 'inline'
  gutter?: number
}>()

const form = useForm({
  schema: props.schema,
  initialValues: props.initialValues,
  onSubmit: props.onSubmit,
})

const formContext = createFormContext()

const effectiveLayout = computed(() => props.layout ?? props.schema?.uiSchema?.layout)

const effectiveGutter = computed(() => props.gutter ?? props.schema?.uiSchema?.gutter)

const formClasses = computed(() => {
  const classes: Record<string, boolean> = {}
  if (effectiveLayout.value) {
    classes[`d-form--${effectiveLayout.value}`] = true
  }
  return classes
})

const formStyles = computed(() => {
  if (effectiveGutter.value != null) {
    return { gap: `${effectiveGutter.value}px` }
  }
  return {}
})

const context = reactive({
  schema: computed(() => props.schema),
  uiSchema: computed(() => props.schema?.uiSchema),
  labelPosition: computed(() => props.labelPosition),
  labelWidth: computed(() => props.labelWidth),
  layout: effectiveLayout,
  gutter: effectiveGutter,
})

provide('d-form', {
  ...form,
  ...formContext,
  ...context,
})

const handleSubmit = async () => {
  await form.submit()
}

defineExpose({
  form,
  values: form.values,
  errors: form.errors,
  touched: form.touched,
  dirty: form.dirty,
  submitting: form.submitting,
  isValid: form.isValid,
  validating: form.validating,
  submitted: form.submitted,
  submitCount: form.submitCount,
  setFieldValue: form.setFieldValue,
  setValues: form.setValues,
  setFieldTouched: form.setFieldTouched,
  getFieldValue: form.getFieldValue,
  getFieldError: form.getFieldError,
  registerField: form.registerField,
  submit: form.submit,
  reset: form.reset,
  validate: form.validate,
  clearErrors: form.clearErrors,
  getErrors: form.getErrors,
  getComponent: formContext.getComponent,
  hasComponent: formContext.hasComponent,
  registerComponent: formContext.registerComponent,
  layout: effectiveLayout,
  gutter: effectiveGutter,
})
</script>

<template>
  <form :class="formClasses" :style="formStyles" @submit.prevent="handleSubmit">
    <DFormItems v-if="schema" />
    <slot />
  </form>
</template>

<style scoped>
.d-form--vertical {
  display: flex;
  flex-direction: column;
}

.d-form--inline {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: 8px 16px;
}
</style>
