/**
 * Field types for d-form
 */

import { z } from 'zod'
import { ReactionConfig } from './reaction'
import { ValidationConfig, type ValidationResult } from './validation'

export const FieldType = z
  .enum(['string', 'number', 'boolean', 'object', 'array', 'date', 'void'])
  .describe('字段类型')

export type FieldType = z.infer<typeof FieldType>

/**
 * Field schema — recursive via getter pattern (Zod v4).
 * `properties` and `items` reference FieldSchema itself;
 * `reactions` references ReactionConfig from ./reaction (circular module dep, safe via ESM live bindings).
 */
export const FieldSchema = z.object({
  type: z.string().describe('字段类型'),
  key: z.string().optional().describe('字段键名/路径'),
  title: z.string().optional().describe('字段标签/标题'),
  description: z.string().optional().describe('字段描述/帮助文本'),
  default: z.any().optional().describe('默认值'),
  component: z.string().optional().describe('渲染组件名称'),
  componentProps: z.record(z.string(), z.any()).optional().describe('组件属性'),
  validation: ValidationConfig.optional().describe('验证配置'),
  get reactions() {
    return z.array(ReactionConfig).optional().describe('字段联动配置')
  },
  visible: z.boolean().optional().describe('字段是否可见'),
  disabled: z.boolean().optional().describe('字段是否禁用'),
  placeholder: z.string().optional().describe('字段占位文本'),
  labelPosition: z.enum(['left', 'right', 'top']).optional().describe('标签位置'),
  labelWidth: z.union([z.string(), z.number()]).optional().describe('标签宽度'),
  required: z.boolean().optional().describe('是否必填'),
  enum: z.array(z.any()).optional().describe('枚举值列表'),
  get properties() {
    return z.record(z.string(), FieldSchema).optional().describe('嵌套属性（对象类型）')
  },
  get items() {
    return FieldSchema.optional().describe('数组项 schema')
  },
})

/**
 * FieldSchema type — preserves the original generic for backward compatibility.
 * The generic T only affects the `default` field.
 */
export type FieldSchema<T = any> = Omit<z.infer<typeof FieldSchema>, 'default'> & { default?: T }

export const FieldState = z.object({
  value: z.any().describe('当前字段值'),
  error: z.string().optional().describe('验证错误消息'),
  touched: z.boolean().describe('字段是否已触碰'),
  dirty: z.boolean().describe('字段值是否已修改'),
  visible: z.boolean().describe('字段可见状态'),
  disabled: z.boolean().describe('字段禁用状态'),
  validating: z.boolean().describe('字段是否正在验证中'),
  loading: z.boolean().optional().describe('字段是否正在加载中'),
  displayValue: z.any().optional().describe('自定义显示值'),
})

export type FieldState<T = any> = Omit<z.infer<typeof FieldState>, 'value' | 'displayValue'> & {
  value: T
  displayValue?: any
}

export const FieldMeta = z.object({
  path: z.string().describe('字段路径'),
  name: z.string().describe('字段名称'),
  schema: FieldSchema.describe('字段 schema 引用'),
  parentPath: z.string().optional().describe('父字段路径'),
  depth: z.number().describe('字段层级深度'),
})

export type FieldMeta = z.infer<typeof FieldMeta>

/**
 * FieldInstance — kept as TypeScript interface (contains methods, not serializable).
 */
export interface FieldInstance {
  /** Field metadata */
  meta: FieldMeta
  /** Current field state */
  state: FieldState
  /** Update field value */
  setValue: (value: any) => void
  /** Set field error */
  setError: (error: string | undefined) => void
  /** Set field touched */
  setTouched: (touched: boolean) => void
  /** Validate field */
  validate: () => Promise<ValidationResult>
  /** Reset field */
  reset: () => void
}
