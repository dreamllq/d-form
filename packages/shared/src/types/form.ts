/**
 * Form types for d-form
 */

import { z } from 'zod'
import { FieldSchema, FieldState } from './field'
import { GridConfig } from './grid'
import { ReactionSchema } from './reaction'
import { FormValidationResult } from './validation'

export const UISchema = z.object({
  layout: z.enum(['vertical', 'inline']).optional().describe('表单布局方向'),
  labelWidth: z.union([z.string(), z.number()]).optional().describe('标签宽度'),
  gutter: z.number().optional().describe('字段间距'),
  columns: z.number().optional().describe('栅格列数'),
  size: z.enum(['small', 'default', 'large']).optional().describe('表单尺寸'),
  labelPosition: z.enum(['left', 'right', 'top']).optional().describe('标签位置'),
  colon: z.boolean().optional().describe('是否在标签后显示冒号'),
  showRequiredAsterisk: z.boolean().optional().describe('是否显示必填星号'),
  grid: GridConfig.optional().describe('栅格布局配置'),
  minColumns: z.number().optional().describe('最小列数'),
})

export type UISchema = z.infer<typeof UISchema>

export const FormSchema = z.object({
  type: z.literal('object').describe('schema 类型（表单固定为 object）'),
  properties: z.record(z.string(), FieldSchema).describe('表单字段 schema'),
  uiSchema: UISchema.optional().describe('UI 配置'),
  reactions: z.array(ReactionSchema).optional().describe('表单级别联动'),
  title: z.string().optional().describe('表单标题'),
  description: z.string().optional().describe('表单描述'),
  default: z.record(z.string(), z.any()).optional().describe('默认表单值'),
  scope: z.record(z.string(), z.any()).optional().describe('表达式作用域变量'),
})

/**
 * FormSchema type — preserves the original generic for backward compatibility.
 * The generic T only affects the `default` field.
 */
export type FormSchema<T = Record<string, any>> = Omit<z.infer<typeof FormSchema>, 'default'> & {
  default?: T
}

export const FormState = z.object({
  values: z.record(z.string(), z.any()).describe('表单值'),
  errors: z.record(z.string(), z.string().optional()).optional().describe('字段级别错误'),
  touched: z.record(z.string(), z.boolean().optional()).optional().describe('字段级别触碰状态'),
  dirty: z.boolean().describe('表单是否已修改'),
  submitting: z.boolean().describe('表单是否正在提交'),
  isValid: z.boolean().describe('表单是否有效'),
  validating: z.boolean().describe('表单是否正在验证'),
  submitted: z.boolean().describe('表单是否已提交'),
  submitCount: z.number().describe('表单提交次数'),
})

/**
 * FormState type — preserves the original generic for backward compatibility.
 * The generic T affects `values`, `errors`, and `touched` fields.
 */
export type FormState<T = Record<string, any>> = {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  dirty: boolean
  submitting: boolean
  isValid: boolean
  validating: boolean
  submitted: boolean
  submitCount: number
}

/**
 * FormInstance — kept as TypeScript interface (contains methods, not serializable).
 */
export interface FormInstance<T = Record<string, any>> {
  /** Form schema */
  schema: FormSchema<T>
  /** Current form state */
  state: FormState<T>
  /** Field states by path */
  fields: Map<string, FieldState>
  /** Get field value by path */
  getFieldValue: (path: string) => any
  /** Set field value by path */
  setFieldValue: (path: string, value: any) => void
  /** Get field state by path */
  getFieldState: (path: string) => FieldState | undefined
  /** Set field state by path */
  setFieldState: (path: string, state: Partial<FieldState>) => void
  /** Get all form values */
  getValues: () => T
  /** Set all form values */
  setValues: (values: Partial<T>) => void
  /** Validate all fields */
  validate: () => Promise<FormValidationResult>
  /** Validate specific field */
  validateField: (path: string) => Promise<FormValidationResult>
  /** Reset form to initial state */
  reset: () => void
  /** Reset specific field */
  resetField: (path: string) => void
  /** Submit form */
  submit: () => Promise<T>
  /** Get form errors */
  getErrors: () => Record<string, string>
  /** Set form errors */
  setErrors: (errors: Record<string, string>) => void
  /** Clear all errors */
  clearErrors: () => void
}

export const FormOptions = z.object({
  schema: FormSchema.optional().describe('表单 schema'),
  initialValues: z.record(z.string(), z.any()).optional().describe('初始值'),
  onSubmit: z.any().optional().describe('提交回调'),
  onValuesChange: z.any().optional().describe('值变更回调'),
  validateOnMount: z.boolean().optional().describe('挂载时验证'),
  validateOnChange: z.boolean().optional().describe('变更时验证'),
  validateOnBlur: z.boolean().optional().describe('失焦时验证'),
})

/**
 * FormOptions type — preserves the original generic for backward compatibility.
 */
export type FormOptions<T = Record<string, any>> = {
  schema?: FormSchema<T>
  initialValues?: Partial<T>
  onSubmit?: (values: T) => Promise<void> | void
  onValuesChange?: (values: T, changedPath: string) => void
  validateOnMount?: boolean
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

/**
 * FormEventHandler — kept as TypeScript type (function type).
 */
export type FormEventHandler = (event: {
  type: 'change' | 'blur' | 'focus' | 'submit'
  path: string
  value?: any
  form: FormInstance
}) => void
