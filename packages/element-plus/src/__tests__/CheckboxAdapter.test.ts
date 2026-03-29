import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CheckboxAdapter from '../adapters/CheckboxAdapter.vue'

const ElCheckboxStub = {
  template: '<div />',
  props: ['modelValue', 'disabled', 'label'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(CheckboxAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElCheckbox: ElCheckboxStub } },
  })
}

describe('CheckboxAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: false })
    expect(wrapper.findComponent(ElCheckboxStub).exists()).toBe(true)
  })

  it('passes modelValue', () => {
    const wrapper = mountAdapter({ modelValue: true })
    expect(wrapper.findComponent(ElCheckboxStub).props('modelValue')).toBe(true)
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: false, disabled: true })
    expect(wrapper.findComponent(ElCheckboxStub).props('disabled')).toBe(true)
  })

  it('applies is-error class when error is truthy', () => {
    const wrapper = mountAdapter({ modelValue: false, error: 'Required' })
    expect(wrapper.classes()).toContain('is-error')
  })

  it('does not apply is-error class when error is falsy', () => {
    const wrapper = mountAdapter({ modelValue: false })
    expect(wrapper.classes()).not.toContain('is-error')
  })

  it('emits update:modelValue', async () => {
    const wrapper = mountAdapter({ modelValue: false })
    const stub = wrapper.findComponent(ElCheckboxStub)
    stub.vm.$emit('update:model-value', true)
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([true])
  })

  it('emits blur', async () => {
    const wrapper = mountAdapter({ modelValue: false })
    const stub = wrapper.findComponent(ElCheckboxStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: false,
      schema: { componentProps: { label: 'Accept terms' } },
    })
    expect(wrapper.findComponent(ElCheckboxStub).props('label')).toBe('Accept terms')
  })
})
