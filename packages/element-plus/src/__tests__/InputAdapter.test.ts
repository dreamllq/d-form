import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import InputAdapter from '../adapters/InputAdapter.vue'

const ElInputStub = {
  template: '<div />',
  props: ['modelValue', 'disabled', 'placeholder'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(InputAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElInput: ElInputStub } },
  })
}

describe('InputAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: 'hello' })
    expect(wrapper.findComponent(ElInputStub).exists()).toBe(true)
  })

  it('passes modelValue', () => {
    const wrapper = mountAdapter({ modelValue: 'hello' })
    expect(wrapper.findComponent(ElInputStub).props('modelValue')).toBe('hello')
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: '', disabled: true })
    expect(wrapper.findComponent(ElInputStub).props('disabled')).toBe(true)
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
    const stub = wrapper.findComponent(ElInputStub)
    stub.vm.$emit('update:model-value', 'new value')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new value'])
  })

  it('emits blur', async () => {
    const wrapper = mountAdapter({ modelValue: '' })
    const stub = wrapper.findComponent(ElInputStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: '',
      schema: { componentProps: { placeholder: 'Enter name' } },
    })
    expect(wrapper.findComponent(ElInputStub).props('placeholder')).toBe('Enter name')
  })
})
