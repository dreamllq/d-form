import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import DForm from '../components/DForm.vue'
import DFormItem from '../components/DFormItem.vue'
import type { FormSchema } from '@d-form/shared'

describe('DForm layout mode', () => {
  it('renders no layout class by default', () => {
    const wrapper = mount(DForm)
    const form = wrapper.find('form')
    expect(form.classes()).not.toContain('d-form--vertical')
    expect(form.classes()).not.toContain('d-form--inline')
  })

  it('applies d-form--vertical class when layout is vertical', () => {
    const wrapper = mount(DForm, {
      props: { layout: 'vertical' },
    })
    const form = wrapper.find('form')
    expect(form.classes()).toContain('d-form--vertical')
  })

  it('applies d-form--inline class when layout is inline', () => {
    const wrapper = mount(DForm, {
      props: { layout: 'inline' },
    })
    const form = wrapper.find('form')
    expect(form.classes()).toContain('d-form--inline')
  })

  it('applies gutter as inline gap style', () => {
    const wrapper = mount(DForm, {
      props: { gutter: 16 },
    })
    const form = wrapper.find('form')
    expect(form.attributes('style')).toContain('gap: 16px')
  })

  it('exposes layout in context for children', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {},
    }
    const wrapper = mount(DForm, {
      props: { schema, layout: 'inline' },
      slots: {
        default: () =>
          h(DFormItem, {
            name: 'name',
            schema: { type: 'string', title: 'Name' },
          }),
      },
    })
    const vm = wrapper.vm as any
    expect(vm.layout).toBe('inline')
  })

  it('reads layout from uiSchema when prop not provided', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      uiSchema: { layout: 'inline' },
    }
    const wrapper = mount(DForm, {
      props: { schema },
    })
    const form = wrapper.find('form')
    expect(form.classes()).toContain('d-form--inline')
  })

  it('prop layout overrides uiSchema layout', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      uiSchema: { layout: 'inline' },
    }
    const wrapper = mount(DForm, {
      props: { schema, layout: 'vertical' },
    })
    const form = wrapper.find('form')
    expect(form.classes()).toContain('d-form--vertical')
    expect(form.classes()).not.toContain('d-form--inline')
  })
})

describe('DForm auto-render', () => {
  it('auto-renders fields when schema provided without slot', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
        email: { type: 'string', title: 'Email' },
        age: { type: 'number', title: 'Age' },
      },
    }
    const wrapper = mount(DForm, { props: { schema } })
    const items = wrapper.findAll('.d-form-item')
    expect(items.length).toBe(3)
  })

  it('auto-renders fields alongside slot content', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
        email: { type: 'string', title: 'Email' },
      },
    }
    const wrapper = mount(DForm, {
      props: { schema },
      slots: {
        default: () => h('button', { type: 'submit' }, 'Submit'),
      },
    })
    const items = wrapper.findAll('.d-form-item')
    expect(items.length).toBe(2)
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Submit')
    // Button appears after the auto-rendered form items
    const form = wrapper.find('form')
    const children = form.element.children
    const lastChild = children[children.length - 1]
    expect(lastChild.tagName).toBe('BUTTON')
  })

  it('does not auto-render when no schema provided', () => {
    const wrapper = mount(DForm)
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
    const wrapper = mount(DForm, { props: { schema } })
    const items = wrapper.findAll('.d-form-item')
    expect(items.length).toBe(2)
  })

  describe('grid integration', () => {
    let resizeCallback: (entries: { contentRect: { width: number } }[]) => void

    beforeEach(() => {
      resizeCallback = () => {}
      const mockResizeObserver = vi.fn().mockImplementation((callback) => {
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

    it('wraps auto-rendered fields in DFormGrid when uiSchema.grid is present', async () => {
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
      const wrapper = mount(DForm, { props: { schema } })
      triggerResize(500)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.d-form-grid').exists()).toBe(true)
      const items = wrapper.findAll('.d-form-item')
      expect(items.length).toBe(2)
    })
  })
})
