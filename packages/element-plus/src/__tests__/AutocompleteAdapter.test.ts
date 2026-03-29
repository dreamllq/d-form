import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AutocompleteAdapter from '../adapters/AutocompleteAdapter.vue'

const ElAutocompleteStub = {
  template: '<div />',
  props: ['modelValue', 'disabled', 'placeholder'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(AutocompleteAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElAutocomplete: ElAutocompleteStub } },
  })
}

describe('AutocompleteAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: 'search' })
    expect(wrapper.findComponent(ElAutocompleteStub).exists()).toBe(true)
  })

  it('passes modelValue', () => {
    const wrapper = mountAdapter({ modelValue: 'search term' })
    expect(wrapper.findComponent(ElAutocompleteStub).props('modelValue')).toBe('search term')
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: 'search', disabled: true })
    expect(wrapper.findComponent(ElAutocompleteStub).props('disabled')).toBe(true)
  })

  it('applies is-error class when error is truthy', () => {
    const wrapper = mountAdapter({ modelValue: 'search', error: 'Required' })
    expect(wrapper.classes()).toContain('is-error')
  })

  it('does not apply is-error class when error is falsy', () => {
    const wrapper = mountAdapter({ modelValue: 'search' })
    expect(wrapper.classes()).not.toContain('is-error')
  })

  it('emits update:modelValue', async () => {
    const wrapper = mountAdapter({ modelValue: 'search' })
    const stub = wrapper.findComponent(ElAutocompleteStub)
    stub.vm.$emit('update:model-value', 'new search')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new search'])
  })

  it('emits blur', async () => {
    const wrapper = mountAdapter({ modelValue: 'search' })
    const stub = wrapper.findComponent(ElAutocompleteStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: 'search',
      schema: { componentProps: { placeholder: 'Search...' } },
    })
    expect(wrapper.findComponent(ElAutocompleteStub).props('placeholder')).toBe('Search...')
  })
})
