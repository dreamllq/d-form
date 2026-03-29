<script setup lang="ts">
import { computed, inject } from 'vue'
import DFormItem from './DFormItem.vue'
import DFormGrid from './DFormGrid.vue'
import type { FieldSchema, FormSchema, GridConfig } from '@d-form/shared'

const formContext = inject<any>('d-form')
const schema = computed(() => formContext?.schema as FormSchema | undefined)

const fields = computed(() => {
  const properties = schema.value?.properties
  if (!properties) return {}
  // Filter out void type fields (non-data fields like dividers)
  const filtered: Record<string, FieldSchema> = {}
  for (const [key, fieldSchema] of Object.entries(properties)) {
    if (fieldSchema.type !== 'void') {
      filtered[key] = fieldSchema
    }
  }
  return filtered
})

const gridConfig = computed(() => {
  const ui = formContext?.uiSchema
  if (!ui) return null

  const grid = ui.grid as GridConfig | undefined
  const hasGrid = grid && Object.keys(grid).length > 0
  const hasColumns = ui.columns != null

  if (!hasGrid && !hasColumns) return null

  if (hasGrid) {
    return {
      maxColumns: grid.maxColumns,
      minColumns: grid.minColumns,
      minColumnWidth: grid.minColumnWidth,
      maxColumnWidth: grid.maxColumnWidth,
      columnGap: grid.columnGap,
      rowGap: grid.rowGap,
      colWrap: grid.colWrap,
    }
  }

  // Fallback: use columns/gutter/minColumns from uiSchema
  return {
    maxColumns: ui.columns,
    minColumns: ui.minColumns,
    columnGap: ui.gutter,
  }
})
</script>

<template>
  <DFormGrid v-if="gridConfig" v-bind="gridConfig">
    <DFormItem
      v-for="(fieldSchema, key) in fields"
      :key="key"
      :name="String(key)"
      :schema="fieldSchema"
    />
  </DFormGrid>
  <template v-else>
    <DFormItem
      v-for="(fieldSchema, key) in fields"
      :key="key"
      :name="String(key)"
      :schema="fieldSchema"
    />
  </template>
</template>
