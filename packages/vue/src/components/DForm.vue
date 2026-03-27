<script setup lang="ts">
import { provide, reactive } from 'vue'
import { useForm, type UseFormReturn } from '../composables/useForm'
import { createFormContext, type DFormContext } from '../renderer'
import type { FormSchema } from '@d-form/shared'

const props = defineProps<{
  schema?: FormSchema
  initialValues?: Record<string, any>
  onSubmit?: (values: any) => Promise<void> | void
}>()

const form = useForm({
  schema: props.schema,
  initialValues: props.initialValues,
  onSubmit: props.onSubmit
})

const formContext = createFormContext()

provide('d-form', {
  ...form,
  ...formContext
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
  registerComponent: formContext.registerComponent
})
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <slot />
  </form>
</template>
