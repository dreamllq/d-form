import { h, type Component, type VNode } from 'vue'
import type { IRenderer, FieldRenderProps, DFormContext } from './types'

const componentRegistry = new Map<string, Component>()

export function registerComponent(name: string, component: Component): void {
  componentRegistry.set(name, component)
}

export function getComponent(name: string): Component | undefined {
  return componentRegistry.get(name)
}

export function hasComponent(name: string): boolean {
  return componentRegistry.has(name)
}

export function clearComponents(): void {
  componentRegistry.clear()
}

export function createRenderer(): IRenderer {
  return {
    registerComponent,
    getComponent,
    hasComponent,
    renderField(field: FieldRenderProps): VNode {
      const componentName = field.schema?.component || 'input'
      const component = getComponent(componentName)
      
      if (!component) {
        return h('input', {
          name: field.name,
          value: field.value,
          disabled: field.disabled,
          onInput: (e: Event) => {
            const target = e.target as HTMLInputElement
            field.onChange(target.value)
          },
          onBlur: field.onBlur
        })
      }

      return h(component, {
        name: field.name,
        modelValue: field.value,
        error: field.error,
        touched: field.touched,
        disabled: field.disabled,
        schema: field.schema,
        'onUpdate:modelValue': field.onChange,
        onBlur: field.onBlur
      })
    }
  }
}

export function createFormContext(): DFormContext {
  const localRegistry = new Map<string, Component>()
  
  return {
    getComponent: (name: string) => localRegistry.get(name) || componentRegistry.get(name),
    hasComponent: (name: string) => localRegistry.has(name) || componentRegistry.has(name),
    registerComponent: (name: string, component: Component) => {
      localRegistry.set(name, component)
    }
  }
}

export type { IRenderer, FieldRenderProps, DFormContext }
