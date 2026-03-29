import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import RateAdapter from '../adapters/RateAdapter.vue'

const ElRateStub = {
  template: '<div />',
  props: ['modelValue', 'disabled', 'max'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(RateAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElRate: ElRateStub } },
  })
}

describe('RateAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: 3 })
    expect(wrapper.findComponent(ElRateStub).exists()).toBe(true)
  })

  it('passes modelValue', () => {
    const wrapper = mountAdapter({ modelValue: 4 })
    expect(wrapper.findComponent(ElRateStub).props('modelValue')).toBe(4)
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: 0, disabled: true })
    expect(wrapper.findComponent(ElRateStub).props('disabled')).toBe(true)
  })

  it('applies is-error class when error is truthy', () => {
    const wrapper = mountAdapter({ modelValue: 0, error: 'Required' })
    expect(wrapper.classes()).toContain('is-error')
  })

  it('does not apply is-error class when error is falsy', () => {
    const wrapper = mountAdapter({ modelValue: 0 })
    expect(wrapper.classes()).not.toContain('is-error')
  })

  it('emits update:modelValue', async () => {
    const wrapper = mountAdapter({ modelValue: 0 })
    const stub = wrapper.findComponent(ElRateStub)
    stub.vm.$emit('update:model-value', 5)
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([5])
  })

  it('does not emit blur (no @blur handler)', async () => {
    const wrapper = mountAdapter({ modelValue: 0 })
    const stub = wrapper.findComponent(ElRateStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeFalsy()
  })

  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: 0,
      schema: { componentProps: { max: 10 } },
    })
    expect(wrapper.findComponent(ElRateStub).props('max')).toBe(10)
  })
})
