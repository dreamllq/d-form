import { describe, it, expect } from 'vitest'
import type { GridConfig, UISchema } from '../types'

function acceptGridConfig(config: GridConfig) {
  return config
}

function acceptUISchema(ui: UISchema) {
  return ui
}

describe('GridConfig type', () => {
  it('accepts all optional fields', () => {
    const config: GridConfig = {
      maxColumns: 4,
      minColumns: 1,
      minColumnWidth: 100,
      maxColumnWidth: 300,
      columnGap: 16,
      rowGap: 8,
      colWrap: true,
    }
    expect(acceptGridConfig(config)).toEqual(config)
  })

  it('accepts empty object', () => {
    const config: GridConfig = {}
    expect(acceptGridConfig(config)).toEqual({})
  })

  it('accepts partial fields', () => {
    const config: GridConfig = {
      maxColumns: 3,
      columnGap: 12,
    }
    expect(acceptGridConfig(config)).toEqual({ maxColumns: 3, columnGap: 12 })
  })
})

describe('UISchema grid field', () => {
  it('accepts grid config', () => {
    const ui: UISchema = {
      grid: {
        maxColumns: 4,
        minColumnWidth: 100,
        columnGap: 16,
        colWrap: true,
      },
    }
    expect(acceptUISchema(ui).grid).toBeDefined()
    expect(acceptUISchema(ui).grid?.maxColumns).toBe(4)
  })

  it('accepts minColumns', () => {
    const ui: UISchema = {
      minColumns: 2,
    }
    expect(acceptUISchema(ui).minColumns).toBe(2)
  })

  it('grid is optional', () => {
    const ui: UISchema = {
      layout: 'horizontal',
      labelWidth: '100px',
    }
    expect(acceptUISchema(ui).grid).toBeUndefined()
  })

  it('accepts grid alongside existing fields', () => {
    const ui: UISchema = {
      layout: 'horizontal',
      columns: 3,
      labelWidth: '120px',
      gutter: 16,
      grid: {
        maxColumns: 6,
        minColumnWidth: 150,
        columnGap: 24,
        rowGap: 16,
      },
      minColumns: 2,
    }
    expect(ui.layout).toBe('horizontal')
    expect(ui.columns).toBe(3)
    expect(ui.grid?.maxColumns).toBe(6)
    expect(ui.minColumns).toBe(2)
  })
})
