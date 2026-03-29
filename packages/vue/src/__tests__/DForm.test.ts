import { describe, it, expect } from 'vitest'
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
      properties: { name: { type: 'string', title: 'Name' } },
    }
    const wrapper = mount(DForm, {
      props: { schema, layout: 'inline' },
      slots: {
        default: () =>
          h(DFormItem, {
            name: 'name',
            schema: schema.properties.name,
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
