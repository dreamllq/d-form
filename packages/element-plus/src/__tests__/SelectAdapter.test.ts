import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SelectAdapter from '../adapters/SelectAdapter.vue'

const ElSelectStub = {
  template: '<div><slot /></div>',
  props: ['modelValue', 'disabled', 'clearable'],
}

const ElOptionStub = {
  template: '<div />',
  props: ['label', 'value', 'disabled'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(SelectAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElSelect: ElSelectStub, ElOption: ElOptionStub } },
  })
}

describe('SelectAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: '' })
    expect(wrapper.findComponent(ElSelectStub).exists()).toBe(true)
  })

  it('passes modelValue', () => {
    const wrapper = mountAdapter({ modelValue: 'a' })
    expect(wrapper.findComponent(ElSelectStub).props('modelValue')).toBe('a')
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: '', disabled: true })
    expect(wrapper.findComponent(ElSelectStub).props('disabled')).toBe(true)
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
    const stub = wrapper.findComponent(ElSelectStub)
    stub.vm.$emit('update:model-value', 'b')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['b'])
  })

  it('emits blur', async () => {
    const wrapper = mountAdapter({ modelValue: '' })
    const stub = wrapper.findComponent(ElSelectStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: '',
      schema: { componentProps: { placeholder: 'Pick one' } },
    })
    // placeholder falls through as attr since stub doesn't declare it
    expect(wrapper.html()).toContain('placeholder')
  })

  it('defaults clearable to true', () => {
    const wrapper = mountAdapter({ modelValue: '' })
    expect(wrapper.findComponent(ElSelectStub).props('clearable')).toBe(true)
  })

  it('allows clearable override via componentProps', () => {
    const wrapper = mountAdapter({
      modelValue: '',
      schema: { componentProps: { clearable: false } },
    })
    expect(wrapper.findComponent(ElSelectStub).props('clearable')).toBe(false)
  })

  it('renders el-option elements from options', () => {
    const wrapper = mountAdapter({
      modelValue: '',
      schema: {
        componentProps: {
          options: [
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
            { label: 'Option C', value: 'c', disabled: true },
          ],
        },
      },
    })
    const options = wrapper.findAllComponents(ElOptionStub)
    expect(options.length).toBe(3)
    expect(options[0].props('label')).toBe('Option A')
    expect(options[0].props('value')).toBe('a')
    expect(options[2].props('disabled')).toBe(true)
  })

  it('renders no options when options is empty', () => {
    const wrapper = mountAdapter({ modelValue: '' })
    const options = wrapper.findAllComponents(ElOptionStub)
    expect(options.length).toBe(0)
  })
})
