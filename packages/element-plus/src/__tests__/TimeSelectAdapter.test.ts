import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TimeSelectAdapter from '../adapters/TimeSelectAdapter.vue'

const ElTimeSelectStub = {
  template: '<div />',
  props: ['modelValue', 'disabled', 'placeholder'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(TimeSelectAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElTimeSelect: ElTimeSelectStub } },
  })
}

describe('TimeSelectAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: '10:00' })
    expect(wrapper.findComponent(ElTimeSelectStub).exists()).toBe(true)
  })

  it('passes modelValue', () => {
    const wrapper = mountAdapter({ modelValue: '10:00' })
    expect(wrapper.findComponent(ElTimeSelectStub).props('modelValue')).toBe('10:00')
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: '10:00', disabled: true })
    expect(wrapper.findComponent(ElTimeSelectStub).props('disabled')).toBe(true)
  })

  it('applies is-error class when error is truthy', () => {
    const wrapper = mountAdapter({ modelValue: '10:00', error: 'Required' })
    expect(wrapper.classes()).toContain('is-error')
  })

  it('does not apply is-error class when error is falsy', () => {
    const wrapper = mountAdapter({ modelValue: '10:00' })
    expect(wrapper.classes()).not.toContain('is-error')
  })

  it('emits update:modelValue', async () => {
    const wrapper = mountAdapter({ modelValue: '10:00' })
    const stub = wrapper.findComponent(ElTimeSelectStub)
    stub.vm.$emit('update:model-value', '11:00')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['11:00'])
  })

  it('emits blur', async () => {
    const wrapper = mountAdapter({ modelValue: '10:00' })
    const stub = wrapper.findComponent(ElTimeSelectStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: '10:00',
      schema: { componentProps: { placeholder: 'Pick a time' } },
    })
    expect(wrapper.findComponent(ElTimeSelectStub).props('placeholder')).toBe('Pick a time')
  })
})
