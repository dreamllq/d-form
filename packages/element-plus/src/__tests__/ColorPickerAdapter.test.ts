import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ColorPickerAdapter from '../adapters/ColorPickerAdapter.vue'

const ElColorPickerStub = {
  template: '<div />',
  props: ['modelValue', 'disabled', 'showAlpha'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(ColorPickerAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElColorPicker: ElColorPickerStub } },
  })
}

describe('ColorPickerAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: '#ff0000' })
    expect(wrapper.findComponent(ElColorPickerStub).exists()).toBe(true)
  })

  it('passes modelValue as string', () => {
    const wrapper = mountAdapter({ modelValue: '#00ff00' })
    expect(wrapper.findComponent(ElColorPickerStub).props('modelValue')).toBe('#00ff00')
  })

  it('passes modelValue as null', () => {
    const wrapper = mountAdapter({ modelValue: null })
    expect(wrapper.findComponent(ElColorPickerStub).props('modelValue')).toBe(null)
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: '#ff0000', disabled: true })
    expect(wrapper.findComponent(ElColorPickerStub).props('disabled')).toBe(true)
  })

  it('applies is-error class when error is truthy', () => {
    const wrapper = mountAdapter({ modelValue: '#ff0000', error: 'Invalid' })
    expect(wrapper.classes()).toContain('is-error')
  })

  it('does not apply is-error class when error is falsy', () => {
    const wrapper = mountAdapter({ modelValue: '#ff0000' })
    expect(wrapper.classes()).not.toContain('is-error')
  })

  it('emits update:modelValue', async () => {
    const wrapper = mountAdapter({ modelValue: '#ff0000' })
    const stub = wrapper.findComponent(ElColorPickerStub)
    stub.vm.$emit('update:model-value', '#00ff00')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['#00ff00'])
  })

  it('emits blur', async () => {
    const wrapper = mountAdapter({ modelValue: '#ff0000' })
    const stub = wrapper.findComponent(ElColorPickerStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: '#ff0000',
      schema: { componentProps: { showAlpha: true } },
    })
    expect(wrapper.findComponent(ElColorPickerStub).props('showAlpha')).toBe(true)
  })
})
