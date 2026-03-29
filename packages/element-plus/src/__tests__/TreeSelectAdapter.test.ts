import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TreeSelectAdapter from '../adapters/TreeSelectAdapter.vue'

const ElTreeSelectStub = {
  template: '<div />',
  props: ['modelValue', 'disabled', 'placeholder'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(TreeSelectAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElTreeSelect: ElTreeSelectStub } },
  })
}

describe('TreeSelectAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: '' })
    expect(wrapper.findComponent(ElTreeSelectStub).exists()).toBe(true)
  })

  it('passes modelValue', () => {
    const wrapper = mountAdapter({ modelValue: 'node1' })
    expect(wrapper.findComponent(ElTreeSelectStub).props('modelValue')).toBe('node1')
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: '', disabled: true })
    expect(wrapper.findComponent(ElTreeSelectStub).props('disabled')).toBe(true)
  })

  it('applies is-error class when error is truthy', () => {
    const wrapper = mountAdapter({ modelValue: '', error: 'Required' })
    expect(wrapper.classes()).toContain('is-error')
  })

  it('does not apply is-error class when error is falsy', () => {
    const wrapper = mountAdapter({ modelValue: '' })
    expect(wrapper.classes()).not.toContain('is-error')
  })

  it('emits update:modelValue', async () => {
    const wrapper = mountAdapter({ modelValue: '' })
    const stub = wrapper.findComponent(ElTreeSelectStub)
    stub.vm.$emit('update:model-value', 'node2')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['node2'])
  })

  it('emits blur', async () => {
    const wrapper = mountAdapter({ modelValue: '' })
    const stub = wrapper.findComponent(ElTreeSelectStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: '',
      schema: { componentProps: { placeholder: 'Select node' } },
    })
    expect(wrapper.findComponent(ElTreeSelectStub).props('placeholder')).toBe('Select node')
  })
})
