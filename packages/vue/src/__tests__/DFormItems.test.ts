import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DForm from '../components/DForm.vue'
import type { FormSchema } from '@d-form/shared'

// Mock ResizeObserver — jsdom doesn't provide it
const mockResizeObserver = vi.fn()
let resizeCallback: (entries: { contentRect: { width: number } }[]) => void

beforeEach(() => {
  resizeCallback = () => {}
  mockResizeObserver.mockImplementation((callback) => {
    resizeCallback = callback
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }
  })
  vi.stubGlobal('ResizeObserver', mockResizeObserver)
})

function triggerResize(width: number) {
  resizeCallback([{ contentRect: { width } }])
}

function mountWithDFormItems(schema?: FormSchema) {
  return mount(DForm, {
    props: { schema },
  })
}

describe('DFormItems auto-rendering', () => {
  it('renders one DFormItem per schema.properties entry', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
        email: { type: 'string', title: 'Email' },
        age: { type: 'number', title: 'Age' },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    const items = wrapper.findAll('.d-form-item')
    expect(items.length).toBe(3)
  })

  it('renders correct labels from schema.title', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        username: { type: 'string', title: 'Username' },
        password: { type: 'string', title: 'Password' },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    const labels = wrapper.findAll('.d-form-item__label')
    expect(labels.length).toBe(2)
    expect(labels[0].text()).toContain('Username')
    expect(labels[1].text()).toContain('Password')
  })

  it('renders nothing when schema has no properties', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {},
    }
    const wrapper = mountWithDFormItems(schema)
    const items = wrapper.findAll('.d-form-item')
    expect(items.length).toBe(0)
  })

  it('renders nothing when schema is undefined', () => {
    const wrapper = mountWithDFormItems(undefined)
    const items = wrapper.findAll('.d-form-item')
    expect(items.length).toBe(0)
  })

  it('filters out void type fields', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        divider: { type: 'void' },
        name: { type: 'string', title: 'Name' },
        spacer: { type: 'void' },
        email: { type: 'string', title: 'Email' },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    const items = wrapper.findAll('.d-form-item')
    expect(items.length).toBe(2)
  })

  it('preserves property key order from schema', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        zebra: { type: 'string', title: 'Zebra' },
        alpha: { type: 'string', title: 'Alpha' },
        middle: { type: 'string', title: 'Middle' },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    const labels = wrapper.findAll('.d-form-item__label')
    expect(labels[0].text()).toContain('Zebra')
    expect(labels[1].text()).toContain('Alpha')
    expect(labels[2].text()).toContain('Middle')
  })

  it('renders default slot content (DField with input) for each property', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
  })
})

describe('DFormItems grid integration', () => {
  it('renders items directly without grid wrapper when no grid config', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
        email: { type: 'string', title: 'Email' },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    expect(wrapper.find('.d-form-grid').exists()).toBe(false)
    const items = wrapper.findAll('.d-form-item')
    expect(items.length).toBe(2)
  })

  it('wraps items in DFormGrid when uiSchema.grid is present', async () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
        email: { type: 'string', title: 'Email' },
      },
      uiSchema: {
        grid: { maxColumns: 2 },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    triggerResize(500)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.d-form-grid').exists()).toBe(true)
    const items = wrapper.findAll('.d-form-item')
    expect(items.length).toBe(2)
  })

  it('passes grid.maxColumns to DFormGrid', async () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
      },
      uiSchema: {
        grid: { maxColumns: 3, minColumnWidth: 100 },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    triggerResize(600)
    await wrapper.vm.$nextTick()

    // 600 / (100 + 8) = 5.55 → floor = 5, clamped to 3
    const grid = wrapper.find('.d-form-grid')
    const style = grid.attributes('style')
    expect(style).toContain('grid-template-columns: repeat(3, 1fr)')
  })

  it('passes grid.columnGap and grid.rowGap to DFormGrid', async () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
      },
      uiSchema: {
        grid: { columnGap: 20, rowGap: 10 },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    triggerResize(500)
    await wrapper.vm.$nextTick()

    const grid = wrapper.find('.d-form-grid')
    const style = grid.attributes('style')
    expect(style).toContain('gap: 10px 20px')
  })

  it('uses uiSchema.columns as maxColumns fallback when grid not present', async () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
      },
      uiSchema: {
        columns: 2,
      },
    }
    const wrapper = mountWithDFormItems(schema)
    triggerResize(600)
    await wrapper.vm.$nextTick()

    const grid = wrapper.find('.d-form-grid')
    expect(grid.exists()).toBe(true)
    // maxColumns=2 should clamp the grid
    const gridComponent = wrapper.findComponent({ name: 'DFormGrid' })
    expect(gridComponent.props('maxColumns')).toBe(2)
  })

  it('uses uiSchema.gutter as columnGap fallback when grid not present', async () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
      },
      uiSchema: {
        columns: 2,
        gutter: 24,
      },
    }
    const wrapper = mountWithDFormItems(schema)
    triggerResize(500)
    await wrapper.vm.$nextTick()

    const grid = wrapper.find('.d-form-grid')
    const style = grid.attributes('style')
    expect(style).toContain('gap: 4px 24px')
  })

  it('uses uiSchema.minColumns as minColumns fallback when grid not present', async () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
      },
      uiSchema: {
        columns: 2,
        minColumns: 3,
      },
    }
    const wrapper = mountWithDFormItems(schema)
    triggerResize(200)
    await wrapper.vm.$nextTick()

    const gridComponent = wrapper.findComponent({ name: 'DFormGrid' })
    expect(gridComponent.props('minColumns')).toBe(3)
  })

  it('prefers grid config over columns/gutter fallbacks', async () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
      },
      uiSchema: {
        grid: { maxColumns: 4, columnGap: 16 },
        columns: 2,
        gutter: 30,
      },
    }
    const wrapper = mountWithDFormItems(schema)
    triggerResize(500)
    await wrapper.vm.$nextTick()

    const grid = wrapper.find('.d-form-grid')
    const style = grid.attributes('style')
    // grid.columnGap=16 should be used, NOT gutter=30
    expect(style).toContain('gap: 4px 16px')
  })

  it('existing items still render correctly when grid is active', async () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
        email: { type: 'string', title: 'Email' },
        divider: { type: 'void' },
      },
      uiSchema: {
        grid: { maxColumns: 2 },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    triggerResize(500)
    await wrapper.vm.$nextTick()

    // void fields still filtered out
    const items = wrapper.findAll('.d-form-item')
    expect(items.length).toBe(2)
    const labels = wrapper.findAll('.d-form-item__label')
    expect(labels[0].text()).toContain('Name')
    expect(labels[1].text()).toContain('Email')
  })
})
