export interface LayoutConfig {
  layout?: 'vertical' | 'inline'
  labelPosition?: 'left' | 'right' | 'top'
  labelWidth?: string | number
  gutter?: number
  colon?: boolean
}

export function resolveLayoutConfig(
  sources: (Partial<LayoutConfig> | undefined)[],
  defaults?: Partial<LayoutConfig>
): LayoutConfig {
  const result: LayoutConfig = { ...defaults }
  for (const source of sources) {
    if (!source) continue
    for (const key of Object.keys(source) as (keyof LayoutConfig)[]) {
      const value = source[key]
      if (value !== undefined) {
        ;(result as any)[key] = value
      }
    }
  }
  return result
}
