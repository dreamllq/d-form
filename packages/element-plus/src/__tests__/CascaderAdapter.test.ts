import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CascaderAdapter from '../adapters/CascaderAdapter.vue'

const ElCascaderStub = {
  template: '<div />',
  props: ['modelValue', 'disabled', 'placeholder'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(CascaderAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElCascader: ElCascaderStub } },
  })
}

describe('CascaderAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: [] })
    expect(wrapper.findComponent(ElCascaderStub).exists()).toBe(true)
  })

  it('passes modelValue', () => {
    const wrapper = mountAdapter({ modelValue: ['a', 'b'] })
    expect(wrapper.findComponent(ElCascaderStub).props('modelValue')).toEqual(['a', 'b'])
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: [], disabled: true })
    expect(wrapper.findComponent(ElCascaderStub).props('disabled')).toBe(true)
  })

  it('applies is-error class when error is truthy', () => {
    const wrapper = mountAdapter({ modelValue: [], error: 'Required' })
    expect(wrapper.classes()).toContain('is-error')
  })

  it('does not apply is-error class when error is falsy', () => {
    const wrapper = mountAdapter({ modelValue: [] })
    expect(wrapper.classes()).not.toContain('is-error')
  })

  it('emits update:modelValue', async () => {
    const wrapper = mountAdapter({ modelValue: [] })
    const stub = wrapper.findComponent(ElCascaderStub)
    stub.vm.$emit('update:model-value', ['a', 'b', 'c'])
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['a', 'b', 'c']])
  })

  it('emits blur', async () => {
    const wrapper = mountAdapter({ modelValue: [] })
    const stub = wrapper.findComponent(ElCascaderStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: [],
      schema: { componentProps: { placeholder: 'Select category' } },
    })
    expect(wrapper.findComponent(ElCascaderStub).props('placeholder')).toBe('Select category')
  })
})
