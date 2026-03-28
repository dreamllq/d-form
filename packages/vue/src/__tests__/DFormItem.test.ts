import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import DForm from '../components/DForm.vue'
import DFormItem from '../components/DFormItem.vue'
import type { FormSchema, FieldSchema, UISchema } from '@d-form/shared'

function mountWithDFormItem(
  name: string,
  fieldSchema?: FieldSchema,
  uiSchema?: UISchema,
  formItemProps?: Record<string, any>,
  slots?: Record<string, any>
) {
  const schema: FormSchema = {
    type: 'object',
    properties: {
      [name]: fieldSchema || { type: 'string' },
    },
    ...(uiSchema ? { uiSchema } : {}),
  }

  const wrapper = mount(DForm, {
    props: { schema },
    slots: {
      default: () =>
        h(
          DFormItem,
          {
            name,
            schema: fieldSchema,
            ...formItemProps,
          },
          slots
        ),
    },
  })

  return wrapper
}

describe('DFormItem label rendering', () => {
  it('renders label text from schema.title', () => {
    const wrapper = mountWithDFormItem('email', {
      type: 'string',
      title: 'Email Address',
    })

    const label = wrapper.find('.d-form-item__label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('Email Address')
  })

  it('uses label prop to override schema.title', () => {
    const wrapper = mountWithDFormItem(
      'email',
      {
        type: 'string',
        title: 'Email Address',
      },
      undefined,
      { label: 'Your Email' }
    )

    const label = wrapper.find('.d-form-item__label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('Your Email')
    expect(label.text()).not.toContain('Email Address')
  })

  it('renders label from label prop when schema has no title', () => {
    const wrapper = mountWithDFormItem(
      'name',
      {
        type: 'string',
      },
      undefined,
      { label: 'Full Name' }
    )

    const label = wrapper.find('.d-form-item__label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('Full Name')
  })

  it('does not render label element when neither title nor label is provided', () => {
    const wrapper = mountWithDFormItem('field', {
      type: 'string',
    })

    const label = wrapper.find('.d-form-item__label')
    expect(label.exists()).toBe(false)
  })
})

describe('DFormItem required asterisk', () => {
  it('shows asterisk when schema.required is true', () => {
    const wrapper = mountWithDFormItem('password', {
      type: 'string',
      title: 'Password',
      required: true,
    })

    const asterisk = wrapper.find('.d-form-item__required')
    expect(asterisk.exists()).toBe(true)
    expect(asterisk.text()).toBe('*')
  })

  it('shows asterisk when required prop is true', () => {
    const wrapper = mountWithDFormItem(
      'password',
      {
        type: 'string',
        title: 'Password',
      },
      undefined,
      { required: true }
    )

    const asterisk = wrapper.find('.d-form-item__required')
    expect(asterisk.exists()).toBe(true)
  })

  it('hides asterisk when required is false/undefined', () => {
    const wrapper = mountWithDFormItem('optional', {
      type: 'string',
      title: 'Optional Field',
    })

    const asterisk = wrapper.find('.d-form-item__required')
    expect(asterisk.exists()).toBe(false)
  })

  it('hides asterisk when uiSchema.showRequiredAsterisk is false', () => {
    const wrapper = mountWithDFormItem(
      'password',
      {
        type: 'string',
        title: 'Password',
        required: true,
      },
      { showRequiredAsterisk: false }
    )

    const asterisk = wrapper.find('.d-form-item__required')
    expect(asterisk.exists()).toBe(false)
  })

  it('shows asterisk by default when required and no uiSchema override', () => {
    const wrapper = mountWithDFormItem('field', {
      type: 'string',
      title: 'Field',
      required: true,
    })

    const asterisk = wrapper.find('.d-form-item__required')
    expect(asterisk.exists()).toBe(true)
  })

  it('asterisk appears after label text', () => {
    const wrapper = mountWithDFormItem('password', {
      type: 'string',
      title: 'Password',
      required: true,
    })

    const label = wrapper.find('.d-form-item__label')
    const html = label.html()
    const asteriskPos = html.indexOf('*')
    const labelTextPos = html.indexOf('Password')
    expect(asteriskPos).toBeGreaterThan(labelTextPos)
  })
})

describe('DFormItem error message display', () => {
  it('shows error message when field has error AND is touched', async () => {
    const wrapper = mountWithDFormItem('email', {
      type: 'string',
      title: 'Email',
    })

    const vm = wrapper.vm as any
    const coreForm = vm.form.form
    const field = coreForm.getField('email')
    field.setError('Required field')
    field.setTouched(true)
    await nextTick()

    const errorDiv = wrapper.find('.d-form-item__error')
    expect(errorDiv.exists()).toBe(true)
    expect(errorDiv.text()).toContain('Required field')
  })

  it('hides error when field has error but is NOT touched', async () => {
    const wrapper = mountWithDFormItem('email', {
      type: 'string',
      title: 'Email',
    })

    const vm = wrapper.vm as any
    const coreForm = vm.form.form
    const field = coreForm.getField('email')
    field.setError('Some error')
    await nextTick()

    const errorDiv = wrapper.find('.d-form-item__error')
    expect(errorDiv.exists()).toBe(false)
  })

  it('hides error when field has no error', async () => {
    const wrapper = mountWithDFormItem('email', {
      type: 'string',
      title: 'Email',
    })

    const vm = wrapper.vm as any
    const coreForm = vm.form.form
    const field = coreForm.getField('email')
    field.setTouched(true)
    await nextTick()

    const errorDiv = wrapper.find('.d-form-item__error')
    expect(errorDiv.exists()).toBe(false)
  })
})

describe('DFormItem description help text', () => {
  it('shows description when schema.description is provided', () => {
    const wrapper = mountWithDFormItem('username', {
      type: 'string',
      title: 'Username',
      description: 'Enter a unique username',
    })

    const desc = wrapper.find('.d-form-item__description')
    expect(desc.exists()).toBe(true)
    expect(desc.text()).toBe('Enter a unique username')
  })

  it('hides description when schema.description is absent', () => {
    const wrapper = mountWithDFormItem('username', {
      type: 'string',
      title: 'Username',
    })

    const desc = wrapper.find('.d-form-item__description')
    expect(desc.exists()).toBe(false)
  })
})

describe('DFormItem UISchema layout', () => {
  it('applies labelWidth from uiSchema as CSS style on label', () => {
    const wrapper = mountWithDFormItem(
      'name',
      {
        type: 'string',
        title: 'Name',
      },
      { labelWidth: 120 }
    )

    const label = wrapper.find('.d-form-item__label')
    expect(label.exists()).toBe(true)
    expect(label.attributes('style')).toContain('width: 120px')
  })

  it('applies labelWidth as string from uiSchema', () => {
    const wrapper = mountWithDFormItem(
      'name',
      {
        type: 'string',
        title: 'Name',
      },
      { labelWidth: '8em' }
    )

    const label = wrapper.find('.d-form-item__label')
    expect(label.exists()).toBe(true)
    expect(label.attributes('style')).toContain('width: 8em')
  })

  it('applies d-form-item--label-top class when labelPosition is top', () => {
    const wrapper = mountWithDFormItem(
      'name',
      {
        type: 'string',
        title: 'Name',
      },
      { labelPosition: 'top' }
    )

    const item = wrapper.find('.d-form-item')
    expect(item.classes()).toContain('d-form-item--label-top')
    expect(item.classes()).not.toContain('d-form-item--label-left')
  })

  it('default layout uses d-form-item--label-left class', () => {
    const wrapper = mountWithDFormItem('name', {
      type: 'string',
      title: 'Name',
    })

    const item = wrapper.find('.d-form-item')
    expect(item.classes()).toContain('d-form-item--label-left')
    expect(item.classes()).not.toContain('d-form-item--label-top')
  })

  it('shows colon after label when uiSchema.colon is true', () => {
    const wrapper = mountWithDFormItem(
      'name',
      {
        type: 'string',
        title: 'Name',
      },
      { colon: true }
    )

    const label = wrapper.find('.d-form-item__label')
    expect(label.text()).toContain('Name:')
  })

  it('does not show colon by default', () => {
    const wrapper = mountWithDFormItem('name', {
      type: 'string',
      title: 'Name',
    })

    const label = wrapper.find('.d-form-item__label')
    expect(label.text()).not.toContain('Name:')
    expect(label.text()).toContain('Name')
  })

  it('default without uiSchema renders correctly with label-left', () => {
    const wrapper = mountWithDFormItem('name', {
      type: 'string',
      title: 'Name',
    })

    const item = wrapper.find('.d-form-item')
    expect(item.classes()).toContain('d-form-item')
    expect(item.classes()).toContain('d-form-item--label-left')

    const label = wrapper.find('.d-form-item__label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toContain('Name')
  })

  it('renders default slot content (DField) when no custom slot provided', () => {
    const wrapper = mountWithDFormItem('name', {
      type: 'string',
      title: 'Name',
    })

    const control = wrapper.find('.d-form-item__control')
    expect(control.exists()).toBe(true)
    const input = control.find('input')
    expect(input.exists()).toBe(true)
  })
})
