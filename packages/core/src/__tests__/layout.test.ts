import { describe, it, expect } from 'vitest'
import { resolveLayoutConfig } from '../layout'
import type { LayoutConfig } from '../layout'

describe('resolveLayoutConfig', () => {
  it('returns empty object when no sources provided', () => {
    const result = resolveLayoutConfig([])
    expect(result).toEqual({})
  })

  it('returns empty object when all sources are undefined', () => {
    const result = resolveLayoutConfig([undefined, undefined])
    expect(result).toEqual({})
  })

  it('merges single source', () => {
    const result = resolveLayoutConfig([{ layout: 'vertical' }])
    expect(result.layout).toBe('vertical')
  })

  it('later source overrides earlier source', () => {
    const result = resolveLayoutConfig([
      { layout: 'vertical', labelWidth: 80 },
      { layout: 'horizontal' },
    ])
    expect(result.layout).toBe('horizontal')
    expect(result.labelWidth).toBe(80)
  })

  it('applies defaults for missing fields', () => {
    const result = resolveLayoutConfig([{ labelWidth: 100 }], { layout: 'horizontal', colon: true })
    expect(result).toEqual({
      layout: 'horizontal',
      colon: true,
      labelWidth: 100,
    })
  })

  it('preserves falsy values (0 and empty string)', () => {
    const result = resolveLayoutConfig([{ gutter: 0, labelWidth: '' }])
    expect(result.gutter).toBe(0)
    expect(result.labelWidth).toBe('')
  })

  it('skips undefined values but keeps null', () => {
    const result = resolveLayoutConfig([
      { layout: 'vertical' },
      { layout: undefined, colon: true },
    ] as (Partial<LayoutConfig> | undefined)[])
    expect(result.layout).toBe('vertical')
    expect(result.colon).toBe(true)
  })

  it('partial override — only some props overridden', () => {
    const result = resolveLayoutConfig(
      [{ layout: 'vertical', labelPosition: 'left', gutter: 16 }, { gutter: 24 }],
      { colon: true }
    )
    expect(result).toEqual({
      colon: true,
      layout: 'vertical',
      labelPosition: 'left',
      gutter: 24,
    })
  })
})
