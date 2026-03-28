<script setup lang="ts">
import { computed, inject, type Component } from 'vue'
import { useField } from '../composables/useField'
import DField from './DField.vue'
import type { FieldSchema } from '@d-form/shared'

const props = defineProps<{
  name: string
  schema?: FieldSchema
  label?: string
  required?: boolean
  component?: string | Component
  disabled?: boolean
  labelPosition?: 'left' | 'right' | 'top'
  labelWidth?: string | number
  prop?: string | string[]
}>()

const formContext = inject<any>('d-form')
const uiSchema = formContext?.uiSchema

const { error } = useField(props.name, formContext?.form, {
  schema: props.schema,
})

const displayLabel = computed(() => props.label ?? props.schema?.title)

const isRequired = computed(() => props.required || props.schema?.required || false)
const showRequiredAsterisk = computed(() => uiSchema?.showRequiredAsterisk !== false)

const showError = computed(() => !!error.value)

const displayDescription = computed(() => props.schema?.description)

const labelPosition = computed(() => {
  return (
    props.labelPosition ??
    props.schema?.labelPosition ??
    formContext?.labelPosition ??
    uiSchema?.labelPosition ??
    'right'
  )
})
const showColon = computed(() => uiSchema?.colon ?? false)
const labelStyle = computed(() => {
  const w =
    props.labelWidth ?? props.schema?.labelWidth ?? formContext?.labelWidth ?? uiSchema?.labelWidth
  if (w !== undefined && w !== null) {
    return { width: typeof w === 'number' ? `${w}px` : w }
  }
  return {}
})

const itemClasses = computed(() => {
  const pos = labelPosition.value
  return {
    'd-form-item': true,
    'd-form-item--label-top': pos === 'top',
    'd-form-item--label-left': pos === 'left',
    'd-form-item--label-right': pos === 'right',
  }
})
</script>

<template>
  <div :class="itemClasses">
    <label v-if="displayLabel" class="d-form-item__label" :style="labelStyle">
      {{ displayLabel }}{{ showColon ? ':' : '' }}
      <span v-if="isRequired && showRequiredAsterisk" class="d-form-item__required">*</span>
    </label>
    <div class="d-form-item__control">
      <slot>
        <DField :name="name" :schema="schema" :component="component" :disabled="disabled" />
      </slot>
    </div>
    <div v-if="showError" class="d-form-item__error">{{ error }}</div>
    <div v-if="displayDescription" class="d-form-item__description">
      {{ displayDescription }}
    </div>
  </div>
</template>

<style scoped>
.d-form-item {
  margin-bottom: 18px;
}

.d-form-item--label-left {
  display: flex;
  align-items: flex-start;
}

.d-form-item--label-top {
  display: flex;
  flex-direction: column;
}

.d-form-item__label {
  flex-shrink: 0;
  font-size: 14px;
}

.d-form-item--label-left .d-form-item__label {
  margin-right: 8px;
}

.d-form-item--label-right {
  display: flex;
  align-items: flex-start;
}

.d-form-item--label-right .d-form-item__label {
  text-align: right;
}

.d-form-item__required {
  color: red;
}

.d-form-item__error {
  color: red;
  font-size: 12px;
}

.d-form-item__description {
  color: gray;
  font-size: 12px;
}
</style>
