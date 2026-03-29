import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CheckboxGroupAdapter from '../adapters/CheckboxGroupAdapter.vue'

const ElCheckboxGroupStub = {
  template: '<div><slot /></div>',
  props: ['modelValue', 'disabled'],
}

const ElCheckboxStub = {
  template: '<div />',
  props: ['value', 'label', 'disabled'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(CheckboxGroupAdapter, {
    props: { name: 'test', ...props },
    global: {
      stubs: {
        ElCheckboxGroup: ElCheckboxGroupStub,
        ElCheckbox: ElCheckboxStub,
      },
    },
  })
}

describe('CheckboxGroupAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: [] })
    expect(wrapper.findComponent(ElCheckboxGroupStub).exists()).toBe(true)
  })

  it('passes modelValue', () => {
    const wrapper = mountAdapter({ modelValue: ['a', 'b'] })
    expect(wrapper.findComponent(ElCheckboxGroupStub).props('modelValue')).toEqual(['a', 'b'])
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: [], disabled: true })
    expect(wrapper.findComponent(ElCheckboxGroupStub).props('disabled')).toBe(true)
  })

  it('applies is-error class when error is truthy', () => {
    const wrapper = mountAdapter({ modelValue: [], error: 'Required' })
    expect(wrapper.classes()).toContain('is-error')
  })

  it('does not apply is-error class when error is falsy', () => {
    const wrapper = mountAdapter({ modelValue: [] })
    expect(wrapper.classes()).not.toContain('is-error')
  })

  it('emits update:modelValue', async () => {
    const wrapper = mountAdapter({ modelValue: [] })
    const stub = wrapper.findComponent(ElCheckboxGroupStub)
    stub.vm.$emit('update:model-value', ['a'])
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['a']])
  })

  it('emits blur', async () => {
    const wrapper = mountAdapter({ modelValue: [] })
    const stub = wrapper.findComponent(ElCheckboxGroupStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('renders el-checkbox options with :value prop', () => {
    const wrapper = mountAdapter({
      modelValue: [],
      schema: {
        componentProps: {
          options: [
            { label: 'Reading', value: 'reading' },
            { label: 'Gaming', value: 'gaming', disabled: true },
          ],
        },
      },
    })
    const checkboxes = wrapper.findAllComponents(ElCheckboxStub)
    expect(checkboxes.length).toBe(2)
    expect(checkboxes[0].props('label')).toBe('Reading')
    expect(checkboxes[0].props('value')).toBe('reading')
    expect(checkboxes[1].props('disabled')).toBe(true)
  })

  it('renders no options when options is empty', () => {
    const wrapper = mountAdapter({ modelValue: [] })
    const checkboxes = wrapper.findAllComponents(ElCheckboxStub)
    expect(checkboxes.length).toBe(0)
  })
})
