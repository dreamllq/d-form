import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import DFormGrid from '../components/DFormGrid.vue'
import DForm from '../components/DForm.vue'

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

describe('DFormGrid rendering', () => {
  it('renders a div with .d-form-grid class', () => {
    const wrapper = mount(DFormGrid)
    expect(wrapper.find('.d-form-grid').exists()).toBe(true)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('applies .d-form-grid class', () => {
    const wrapper = mount(DFormGrid)
    expect(wrapper.classes()).toContain('d-form-grid')
  })

  it('renders slot content inside the grid', () => {
    const wrapper = mount(DFormGrid, {
      slots: {
        default: () => h('div', { class: 'child' }, 'child content'),
      },
    })

    expect(wrapper.find('.child').exists()).toBe(true)
    expect(wrapper.find('.child').text()).toBe('child content')
  })
})

describe('DFormGrid default styles', () => {
  it('applies default gap style after ResizeObserver fires', async () => {
    const wrapper = mount(DFormGrid)
    triggerResize(500)
    await nextTick()

    const style = wrapper.attributes('style')
    expect(style).toContain('gap: 4px 8px')
  })

  it('starts with zero columns before ResizeObserver fires', () => {
    const wrapper = mount(DFormGrid)
    const style = wrapper.attributes('style')
    expect(style).toContain('grid-template-columns: none')
  })
})

describe('DFormGrid column calculation', () => {
  it('calculates columns based on container width', async () => {
    const wrapper = mount(DFormGrid, {
      props: { minColumnWidth: 100 },
    })
    triggerResize(500)
    await nextTick()

    // 500 / (100 + 8) = 4.629 → floor = 4
    const style = wrapper.attributes('style')
    expect(style).toContain('grid-template-columns: repeat(4, 1fr)')
  })

  it('maxColumns limits calculated columns', async () => {
    const wrapper = mount(DFormGrid, {
      props: { maxColumns: 3, minColumnWidth: 100 },
    })
    triggerResize(600)
    await nextTick()

    // 600 / (100 + 8) = 5.55 → floor = 5, clamped to 3
    const style = wrapper.attributes('style')
    expect(style).toContain('grid-template-columns: repeat(3, 1fr)')
  })

  it('minColumns enforces minimum', async () => {
    const wrapper = mount(DFormGrid, {
      props: { minColumns: 3, minColumnWidth: 100 },
    })
    triggerResize(200)
    await nextTick()

    // 200 / (100 + 8) = 1.85 → floor = 1, bumped to 3
    const style = wrapper.attributes('style')
    expect(style).toContain('grid-template-columns: repeat(3, 1fr)')
  })

  it('narrow container produces fewer columns', async () => {
    const wrapper = mount(DFormGrid, {
      props: { minColumnWidth: 100 },
    })
    triggerResize(200)
    await nextTick()

    // 200 / (100 + 8) = 1.85 → floor = 1
    const style = wrapper.attributes('style')
    expect(style).toContain('grid-template-columns: repeat(1, 1fr)')
  })

  it('respects custom columnGap in calculation', async () => {
    const wrapper = mount(DFormGrid, {
      props: { minColumnWidth: 100, columnGap: 20 },
    })
    triggerResize(360)
    await nextTick()

    // 360 / (100 + 20) = 3
    const style = wrapper.attributes('style')
    expect(style).toContain('grid-template-columns: repeat(3, 1fr)')
  })
})

describe('DFormGrid colWrap', () => {
  it('colWrap=true sets flexWrap to wrap', async () => {
    const wrapper = mount(DFormGrid, {
      props: { colWrap: true },
    })
    triggerResize(500)
    await nextTick()

    const style = wrapper.attributes('style')
    expect(style).toContain('flex-wrap: wrap')
  })

  it('colWrap=false sets flexWrap to nowrap', async () => {
    const wrapper = mount(DFormGrid, {
      props: { colWrap: false },
    })
    triggerResize(500)
    await nextTick()

    const style = wrapper.attributes('style')
    expect(style).toContain('flex-wrap: nowrap')
  })
})

describe('DFormGrid standalone and inside DForm', () => {
  it('works standalone without DForm parent', async () => {
    const wrapper = mount(DFormGrid, {
      props: { minColumnWidth: 100 },
      slots: {
        default: () => h('div', { class: 'item' }, 'Item 1'),
      },
    })
    triggerResize(300)
    await nextTick()

    expect(wrapper.find('.d-form-grid').exists()).toBe(true)
    expect(wrapper.find('.item').exists()).toBe(true)
    const style = wrapper.attributes('style')
    expect(style).toContain('grid-template-columns: repeat(2, 1fr)')
  })

  it('works inside DForm parent', async () => {
    const wrapper = mount(DForm, {
      props: {
        schema: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      },
      slots: {
        default: () =>
          h(
            DFormGrid,
            { minColumnWidth: 100 },
            {
              default: () => h('div', { class: 'grid-child' }, 'Inside DForm'),
            }
          ),
      },
    })

    const grid = wrapper.findComponent(DFormGrid)
    triggerResize(400)
    await nextTick()

    expect(grid.find('.d-form-grid').exists()).toBe(true)
    expect(grid.find('.grid-child').exists()).toBe(true)
    expect(grid.find('.grid-child').text()).toBe('Inside DForm')
  })
})

describe('DFormGrid cleanup', () => {
  it('disconnects ResizeObserver on unmount', () => {
    const createdObservers: Array<{ disconnect: ReturnType<typeof vi.fn> }> = []
    mockResizeObserver.mockImplementation((callback) => {
      resizeCallback = callback
      const instance = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }
      createdObservers.push(instance)
      return instance
    })
    vi.stubGlobal('ResizeObserver', mockResizeObserver)

    const wrapper = mount(DFormGrid)
    expect(createdObservers.length).toBe(1)

    wrapper.unmount()

    expect(createdObservers[0].disconnect).toHaveBeenCalled()
  })
})
