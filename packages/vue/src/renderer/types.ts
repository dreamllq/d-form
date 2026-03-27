import type { Component, VNode } from 'vue'
import type { FieldSchema } from '@d-form/shared'

/**
 * Props passed to renderField for component rendering
 */
export interface FieldRenderProps {
  /** Field name/path */
  name: string
  /** Field schema configuration */
  schema: FieldSchema
  /** Current field value */
  value: any
  /** Validation error message */
  error?: string
  /** Field has been touched */
  touched?: boolean
  /** Field is disabled */
  disabled?: boolean
  /** Handler for value changes */
  onChange: (value: any) => void
  /** Handler for blur events */
  onBlur: () => void
}

/**
 * Renderer interface for component-based form rendering
 */
export interface IRenderer {
  /** Register a component by name */
  registerComponent(name: string, component: Component): void
  /** Get a registered component by name */
  getComponent(name: string): Component | undefined
  /** Check if a component is registered */
  hasComponent(name: string): boolean
  /** Render a field to a VNode */
  renderField(field: FieldRenderProps): VNode
}

/**
 * Context provided to form components
 */
export interface DFormContext {
  /** Get a registered component by name */
  getComponent: (name: string) => Component | undefined
  /** Check if component is registered */
  hasComponent: (name: string) => boolean
  /** Register a new component */
  registerComponent: (name: string, component: Component) => void
}
