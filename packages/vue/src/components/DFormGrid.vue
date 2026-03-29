<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { GridConfig } from '@d-form/shared'

const props = withDefaults(
  defineProps<{
    maxColumns?: number
    minColumns?: number
    minColumnWidth?: number
    maxColumnWidth?: number
    columnGap?: number
    rowGap?: number
    colWrap?: boolean
  }>(),
  {
    minColumnWidth: 100,
    columnGap: 8,
    rowGap: 4,
    colWrap: true,
  }
)

const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
let observer: ResizeObserver | null = null

function calcColumns(width: number): number {
  const minCol = props.minColumns ?? 0
  const maxCol = props.maxColumns ?? Infinity
  const minW = props.minColumnWidth ?? 100
  const gap = props.columnGap ?? 8
  const calculated = Math.floor(width / (minW + gap))
  return Math.max(minCol, Math.min(maxCol, calculated))
}

const columns = computed(() => calcColumns(containerWidth.value))

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: columns.value > 0 ? `repeat(${columns.value}, 1fr)` : 'none',
  gap: `${props.rowGap ?? 4}px ${props.columnGap ?? 8}px`,
  flexWrap: props.colWrap ? 'wrap' : 'nowrap',
}))

onMounted(() => {
  if (containerRef.value) {
    observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth.value = entry.contentRect.width
      }
    })
    observer.observe(containerRef.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div ref="containerRef" class="d-form-grid" :style="gridStyle">
    <slot />
  </div>
</template>

<style scoped>
.d-form-grid {
  width: 100%;
}
</style>
