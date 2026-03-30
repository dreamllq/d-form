/**
 * Validation types for d-form
 */

import { z } from 'zod'

export const ValidationTrigger = z.enum(['blur', 'change']).describe('验证触发时机')

export type ValidationTrigger = z.infer<typeof ValidationTrigger>

export const ValidationRule = z.object({
  type: z
    .enum(['required', 'min', 'max', 'minLength', 'maxLength', 'pattern', 'custom'])
    .describe('验证规则类型'),
  value: z.any().optional().describe('规则值'),
  message: z.string().optional().describe('自定义错误消息'),
  validator: z.any().optional().describe('自定义验证函数'),
  trigger: z
    .union([ValidationTrigger, z.array(ValidationTrigger)])
    .optional()
    .describe('验证触发条件'),
})

export type ValidationRule = z.infer<typeof ValidationRule>

export const ValidationConfig = z.object({
  rules: z.array(ValidationRule).optional().describe('验证规则列表'),
  validator: z.string().optional().describe('自定义验证函数名称或表达式'),
  trigger: z
    .union([z.enum(['blur', 'change', 'submit']), z.array(z.enum(['blur', 'change', 'submit']))])
    .optional()
    .describe('验证触发时机'),
  validateVisibleOnly: z.boolean().optional().describe('是否仅验证可见字段'),
})

export type ValidationConfig = z.infer<typeof ValidationConfig>

export const ValidationResult = z.object({
  valid: z.boolean().describe('验证是否通过'),
  errors: z.array(z.string()).describe('错误消息列表'),
  warnings: z.array(z.string()).optional().describe('警告消息列表'),
})

export type ValidationResult = z.infer<typeof ValidationResult>

export const FieldValidationResult = z.object({
  field: z.string().describe('字段名称/路径'),
  result: ValidationResult.describe('验证结果'),
})

export type FieldValidationResult = z.infer<typeof FieldValidationResult>

export const FormValidationResult = z.object({
  valid: z.boolean().describe('表单是否有效'),
  fields: z.record(z.string(), ValidationResult).describe('字段级别验证结果'),
  errors: z.array(z.string()).describe('所有错误消息'),
})

export type FormValidationResult = z.infer<typeof FormValidationResult>
