import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TimePickerAdapter from '../adapters/TimePickerAdapter.vue'

const ElTimePickerStub = {
  template: '<div />',
  props: ['modelValue', 'disabled', 'clearable', 'placeholder'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(TimePickerAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElTimePicker: ElTimePickerStub } },
  })
}

describe('TimePickerAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: '' })
    expect(wrapper.findComponent(ElTimePickerStub).exists()).toBe(true)
  })

  it('passes modelValue', () => {
    const wrapper = mountAdapter({ modelValue: '10:30' })
    expect(wrapper.findComponent(ElTimePickerStub).props('modelValue')).toBe('10:30')
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: '', disabled: true })
    expect(wrapper.findComponent(ElTimePickerStub).props('disabled')).toBe(true)
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
    const stub = wrapper.findComponent(ElTimePickerStub)
    stub.vm.$emit('update:model-value', '11:00')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['11:00'])
  })

  it('emits blur', async () => {
    const wrapper = mountAdapter({ modelValue: '' })
    const stub = wrapper.findComponent(ElTimePickerStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: '',
      schema: { componentProps: { placeholder: 'Pick a time' } },
    })
    expect(wrapper.findComponent(ElTimePickerStub).props('placeholder')).toBe('Pick a time')
  })

  it('defaults clearable to true', () => {
    const wrapper = mountAdapter({ modelValue: '' })
    expect(wrapper.findComponent(ElTimePickerStub).props('clearable')).toBe(true)
  })

  it('allows clearable override via componentProps', () => {
    const wrapper = mountAdapter({
      modelValue: '',
      schema: { componentProps: { clearable: false } },
    })
    expect(wrapper.findComponent(ElTimePickerStub).props('clearable')).toBe(false)
  })
})
