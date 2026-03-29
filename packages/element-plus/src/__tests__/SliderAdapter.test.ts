import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SliderAdapter from '../adapters/SliderAdapter.vue'

const ElSliderStub = {
  template: '<div />',
  props: ['modelValue', 'disabled', 'min', 'max'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(SliderAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElSlider: ElSliderStub } },
  })
}

describe('SliderAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: 50 })
    expect(wrapper.findComponent(ElSliderStub).exists()).toBe(true)
  })

  it('passes modelValue', () => {
    const wrapper = mountAdapter({ modelValue: 75 })
    expect(wrapper.findComponent(ElSliderStub).props('modelValue')).toBe(75)
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: 50, disabled: true })
    expect(wrapper.findComponent(ElSliderStub).props('disabled')).toBe(true)
  })

  it('applies is-error class when error is truthy', () => {
    const wrapper = mountAdapter({ modelValue: 50, error: 'Required' })
    expect(wrapper.classes()).toContain('is-error')
  })

  it('does not apply is-error class when error is falsy', () => {
    const wrapper = mountAdapter({ modelValue: 50 })
    expect(wrapper.classes()).not.toContain('is-error')
  })

  it('emits update:modelValue', async () => {
    const wrapper = mountAdapter({ modelValue: 50 })
    const stub = wrapper.findComponent(ElSliderStub)
    stub.vm.$emit('update:model-value', 80)
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([80])
  })

  it('does not emit blur (no @blur handler in template)', async () => {
    const wrapper = mountAdapter({ modelValue: 50 })
    const stub = wrapper.findComponent(ElSliderStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeFalsy()
  })

  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: 50,
      schema: { componentProps: { min: 0, max: 100 } },
    })
    const stub = wrapper.findComponent(ElSliderStub)
    expect(stub.props('min')).toBe(0)
    expect(stub.props('max')).toBe(100)
  })

  it('supports range modelValue as array', () => {
    const wrapper = mountAdapter({ modelValue: [20, 80] })
    expect(wrapper.findComponent(ElSliderStub).props('modelValue')).toEqual([20, 80])
  })
})
