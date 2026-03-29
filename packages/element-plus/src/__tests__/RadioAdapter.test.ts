import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import RadioAdapter from '../adapters/RadioAdapter.vue'

const ElRadioGroupStub = {
  template: '<div><slot /></div>',
  props: ['modelValue', 'disabled'],
}

const ElRadioStub = {
  template: '<div />',
  props: ['value', 'label', 'disabled'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(RadioAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElRadioGroup: ElRadioGroupStub, ElRadio: ElRadioStub } },
  })
}

 describe('RadioAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: '' })
    expect(wrapper.findComponent(ElRadioGroupStub).exists()).toBe(true)
  })
  it('passes modelValue', () => {
    const wrapper = mountAdapter({ modelValue: 'male' })
    expect(wrapper.findComponent(ElRadioGroupStub).props('modelValue')).toBe('male')
  })
  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: '', disabled: true })
    expect(wrapper.findComponent(ElRadioGroupStub).props('disabled')).toBe(true)
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
    const stub = wrapper.findComponent(ElRadioGroupStub)
    stub.vm.$emit('update:model-value', 'female')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['female'])
  })
  it('emits blur', async () => {
    const wrapper = mountAdapter({ modelValue: '' })
    const stub = wrapper.findComponent(ElRadioGroupStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })
  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: '',
      schema: { componentProps: { size: 'large' } },
    })
    expect(wrapper.html()).toContain('large')
  })
  it('renders el-radio options with :value prop', () => {
    const wrapper = mountAdapter({
      modelValue: '',
      schema: {
        componentProps: {
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ],
        },
      },
    })
    const radios = wrapper.findAllComponents(ElRadioStub)
    expect(radios.length).toBe(2)
    expect(radios[0].props('label')).toBe('Male')
    expect(radios[0].props('value')).toBe('male')
    expect(radios[1].props('label')).toBe('Female')
    expect(radios[1].props('value')).toBe('female')
  })
  it('renders no options when options is empty', () => {
    const wrapper = mountAdapter({ modelValue: '' })
    const radios = wrapper.findAllComponents(ElRadioStub)
    expect(radios.length).toBe(0)
  })
})
