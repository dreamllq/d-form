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
  gridSpan?: number
}>()

const formContext = inject<any>('d-form')
const uiSchema = formContext?.uiSchema

const { error, visible } = useField(props.name, formContext?.form, {
  schema: props.schema,
})

const displayLabel = computed(() => props.label ?? props.schema?.title)

const isRequired = computed(() => {
  if (props.required || props.schema?.required) return true
  return props.schema?.validation?.rules?.some((r) => r.type === 'required') ?? false
})
const showRequiredAsterisk = computed(() => uiSchema?.showRequiredAsterisk !== false)

const displayDescription = computed(() => props.schema?.description)

const effectiveLabelPosition = computed(() => {
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
    props.labelWidth ??
    props.schema?.labelWidth ??
    formContext?.labelWidth ??
    uiSchema?.labelWidth ??
    '60px'
  return { width: typeof w === 'number' ? `${w}px` : w }
})

const itemClasses = computed(() => {
  const pos = effectiveLabelPosition.value
  return {
    'd-form-item': true,
    'd-form-item--label-top': pos === 'top',
    'd-form-item--label-left': pos === 'left',
    'd-form-item--label-right': pos === 'right',
  }
})

const itemStyle = computed(() => {
  if (props.gridSpan === -1) return { gridColumn: '1 / -1' }
  if (props.gridSpan && props.gridSpan > 0) return { gridColumn: `span ${props.gridSpan}` }
  return {}
})
</script>

<template>
  <div v-show="visible" :class="itemClasses" :style="itemStyle">
    <div
      class="d-form-item__label-wrap"
      :style="displayLabel && effectiveLabelPosition !== 'top' ? labelStyle : {}"
    >
      <label
        v-if="displayLabel"
        class="d-form-item__label"
        :style="displayLabel && effectiveLabelPosition !== 'top' ? labelStyle : {}"
        :class="{ 'is-required': isRequired && showRequiredAsterisk }"
      >
        {{ displayLabel }}{{ showColon ? ':' : '' }}
      </label>
    </div>
    <div class="d-form-item__control">
      <slot>
        <DField :name="name" :schema="schema" :component="component" :disabled="disabled" />
      </slot>
      <div v-if="error" class="d-form-item__error">{{ error }}</div>
      <div v-if="displayDescription" class="d-form-item__description">
        {{ displayDescription }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.d-form-item {
  padding-bottom: 18px;
}

.d-form-item__label-wrap {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.d-form-item--label-left {
  display: flex;
  align-items: center;
}

.d-form-item--label-top {
  display: flex;
  flex-direction: column;
}

.d-form-item--label-top .d-form-item__label {
  line-height: normal;
  margin-bottom: 8px;
}

.d-form-item__label.is-required::before {
  content: '*';
  color: red;
  margin-right: 4px;
}

.d-form-item__label {
  flex-shrink: 0;
  font-size: 14px;
  line-height: 1;
}

.d-form-item--label-left .d-form-item__label {
  margin-right: 8px;
}

.d-form-item--label-right {
  display: flex;
  align-items: center;
}

.d-form-item--label-right .d-form-item__label {
  text-align: right;
  margin-right: 8px;
}

.d-form-item__control {
  position: relative;
  flex: 1;
}

.d-form-item__error {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: -2px;
  color: red;
  font-size: 12px;
  line-height: 18px;
}

.d-form-item__description {
  color: gray;
  font-size: 12px;
}
</style>
