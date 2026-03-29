import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DatePickerAdapter from '../adapters/DatePickerAdapter.vue'

const ElDatePickerStub = {
  template: '<div />',
  props: ['modelValue', 'disabled', 'clearable', 'type', 'placeholder'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(DatePickerAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElDatePicker: ElDatePickerStub } },
  })
}

describe('DatePickerAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: '' })
    expect(wrapper.findComponent(ElDatePickerStub).exists()).toBe(true)
  })

  it('passes modelValue', () => {
    const wrapper = mountAdapter({ modelValue: '2024-01-01' })
    expect(wrapper.findComponent(ElDatePickerStub).props('modelValue')).toBe('2024-01-01')
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: '', disabled: true })
    expect(wrapper.findComponent(ElDatePickerStub).props('disabled')).toBe(true)
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
    const stub = wrapper.findComponent(ElDatePickerStub)
    stub.vm.$emit('update:model-value', '2024-06-15')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['2024-06-15'])
  })

  it('emits blur', async () => {
    const wrapper = mountAdapter({ modelValue: '' })
    const stub = wrapper.findComponent(ElDatePickerStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: '',
      schema: { componentProps: { placeholder: 'Pick a date' } },
    })
    expect(wrapper.findComponent(ElDatePickerStub).props('placeholder')).toBe('Pick a date')
  })

  it('defaults clearable to true', () => {
    const wrapper = mountAdapter({ modelValue: '' })
    expect(wrapper.findComponent(ElDatePickerStub).props('clearable')).toBe(true)
  })

  it('allows clearable override via componentProps', () => {
    const wrapper = mountAdapter({
      modelValue: '',
      schema: { componentProps: { clearable: false } },
    })
    expect(wrapper.findComponent(ElDatePickerStub).props('clearable')).toBe(false)
  })

  it('defaults type to date', () => {
    const wrapper = mountAdapter({ modelValue: '' })
    expect(wrapper.findComponent(ElDatePickerStub).props('type')).toBe('date')
  })

  it('allows type override via componentProps', () => {
    const wrapper = mountAdapter({
      modelValue: '',
      schema: { componentProps: { type: 'datetime' } },
    })
    expect(wrapper.findComponent(ElDatePickerStub).props('type')).toBe('datetime')
  })
})
