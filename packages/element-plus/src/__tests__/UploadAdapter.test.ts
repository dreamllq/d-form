import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import UploadAdapter from '../adapters/UploadAdapter.vue'

const ElUploadStub = {
  template: '<div />',
  props: ['fileList', 'disabled', 'action'],
}

function mountAdapter(props: Record<string, any>) {
  return mount(UploadAdapter, {
    props: { name: 'test', ...props },
    global: { stubs: { ElUpload: ElUploadStub } },
  })
}

const mockFile = { name: 'test.jpg', status: 'ready', uid: 1 }
const mockFile2 = { name: 'file.txt', status: 'success', uid: 2 }

describe('UploadAdapter', () => {
  it('renders without error', () => {
    const wrapper = mountAdapter({ modelValue: [] })
    expect(wrapper.findComponent(ElUploadStub).exists()).toBe(true)
  })

  it('uses :file-list instead of :model-value', () => {
    const wrapper = mountAdapter({ modelValue: [] })
    expect(wrapper.findComponent(ElUploadStub).props('fileList')).toEqual([])
  })

  it('passes disabled', () => {
    const wrapper = mountAdapter({ modelValue: [], disabled: true })
    expect(wrapper.findComponent(ElUploadStub).props('disabled')).toBe(true)
  })

  it('applies is-error class when error is truthy', () => {
    const wrapper = mountAdapter({ modelValue: [], error: 'Required' })
    expect(wrapper.classes()).toContain('is-error')
  })

  it('does not apply is-error class when error is falsy', () => {
    const wrapper = mountAdapter({ modelValue: [] })
    expect(wrapper.classes()).not.toContain('is-error')
  })

  it('emits update:modelValue on change', async () => {
    const wrapper = mountAdapter({ modelValue: [] })
    const stub = wrapper.findComponent(ElUploadStub)
    stub.vm.$emit('change', mockFile, [mockFile, mockFile2])
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted).toBeTruthy()
    // handleChange emits the full file list from the change event
    expect(emitted[0][0]).toEqual([mockFile, mockFile2])
  })

  it('does not emit blur', async () => {
    const wrapper = mountAdapter({ modelValue: [] })
    const stub = wrapper.findComponent(ElUploadStub)
    stub.vm.$emit('blur')
    await nextTick()
    expect(wrapper.emitted('blur')).toBeFalsy()
  })

  it('passes componentProps via v-bind', () => {
    const wrapper = mountAdapter({
      modelValue: [],
      schema: { componentProps: { action: '/api/upload' } },
    })
    expect(wrapper.findComponent(ElUploadStub).props('action')).toBe('/api/upload')
  })
})
