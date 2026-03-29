import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import InputNumberAdapter from '../adapters/InputNumberAdapter.vue'

const ElInputNumberStub = {
  template: '<div />',
  props: ['modelValue', 'disabled', 'controls', 'placeholder'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(InputNumberAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElInputNumber: ElInputNumberStub } },
  })
}

describe('InputNumberAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: 5 })
    expect(wrapper.findComponent(ElInputNumberStub).exists()).toBe(true)
  })

  it('passes modelValue', () => {
    const wrapper = mountAdapter({ modelValue: 42 })
    expect(wrapper.findComponent(ElInputNumberStub).props('modelValue')).toBe(42)
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: 5, disabled: true })
    expect(wrapper.findComponent(ElInputNumberStub).props('disabled')).toBe(true)
  })

  it('applies is-error class when error is truthy', () => {
    const wrapper = mountAdapter({ modelValue: 5, error: 'Invalid' })
    expect(wrapper.classes()).toContain('is-error')
  })

  it('does not apply is-error class when error is falsy', () => {
    const wrapper = mountAdapter({ modelValue: 5 })
    expect(wrapper.classes()).not.toContain('is-error')
  })

  it('emits update:modelValue', async () => {
    const wrapper = mountAdapter({ modelValue: 5 })
    const stub = wrapper.findComponent(ElInputNumberStub)
    stub.vm.$emit('update:model-value', 10)
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([10])
  })

  it('emits blur', async () => {
    const wrapper = mountAdapter({ modelValue: 5 })
    const stub = wrapper.findComponent(ElInputNumberStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: 5,
      schema: { componentProps: { placeholder: 'Enter number' } },
    })
    expect(wrapper.findComponent(ElInputNumberStub).props('placeholder')).toBe('Enter number')
  })

  it('defaults controls to true', () => {
    const wrapper = mountAdapter({ modelValue: 5 })
    expect(wrapper.findComponent(ElInputNumberStub).props('controls')).toBe(true)
  })

  it('allows controls override via componentProps', () => {
    const wrapper = mountAdapter({
      modelValue: 5,
      schema: { componentProps: { controls: false } },
    })
    expect(wrapper.findComponent(ElInputNumberStub).props('controls')).toBe(false)
  })
})
