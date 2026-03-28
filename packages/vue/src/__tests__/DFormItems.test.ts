import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import DForm from '../components/DForm.vue'
import DFormItems from '../components/DFormItems.vue'
import type { FormSchema } from '@d-form/shared'

function mountWithDFormItems(schema?: FormSchema) {
  return mount(DForm, {
    props: { schema },
    slots: {
      default: () => h(DFormItems),
    },
  })
}

describe('DFormItems auto-rendering', () => {
  it('renders one DFormItem per schema.properties entry', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
        email: { type: 'string', title: 'Email' },
        age: { type: 'number', title: 'Age' },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    const items = wrapper.findAll('.d-form-item')
    expect(items.length).toBe(3)
  })

  it('renders correct labels from schema.title', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        username: { type: 'string', title: 'Username' },
        password: { type: 'string', title: 'Password' },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    const labels = wrapper.findAll('.d-form-item__label')
    expect(labels.length).toBe(2)
    expect(labels[0].text()).toContain('Username')
    expect(labels[1].text()).toContain('Password')
  })

  it('renders nothing when schema has no properties', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {},
    }
    const wrapper = mountWithDFormItems(schema)
    const items = wrapper.findAll('.d-form-item')
    expect(items.length).toBe(0)
  })

  it('renders nothing when schema is undefined', () => {
    const wrapper = mountWithDFormItems(undefined)
    const items = wrapper.findAll('.d-form-item')
    expect(items.length).toBe(0)
  })

  it('filters out void type fields', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        divider: { type: 'void' },
        name: { type: 'string', title: 'Name' },
        spacer: { type: 'void' },
        email: { type: 'string', title: 'Email' },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    const items = wrapper.findAll('.d-form-item')
    expect(items.length).toBe(2)
  })

  it('preserves property key order from schema', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        zebra: { type: 'string', title: 'Zebra' },
        alpha: { type: 'string', title: 'Alpha' },
        middle: { type: 'string', title: 'Middle' },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    const labels = wrapper.findAll('.d-form-item__label')
    expect(labels[0].text()).toContain('Zebra')
    expect(labels[1].text()).toContain('Alpha')
    expect(labels[2].text()).toContain('Middle')
  })

  it('renders default slot content (DField with input) for each property', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
      },
    }
    const wrapper = mountWithDFormItems(schema)
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
  })
})
