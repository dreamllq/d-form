/**
 * Reaction (linkage) types for d-form
 * Based on x-reactions protocol (Formily-style)
 */

import { z } from 'zod'
import { FieldSchema, FieldState } from './field'

export const ReactionEffect = z.object({
  get state() {
    return FieldState.partial().optional().describe('要应用的状态变更')
  },
  get schema() {
    return FieldSchema.partial().optional().describe('要应用的 schema 变更')
  },
  run: z.string().optional().describe('自定义执行动作（表达式字符串）'),
})

export type ReactionEffect = z.infer<typeof ReactionEffect>

export const ReactionConfig = z.object({
  dependencies: z.array(z.string()).optional().describe('依赖的字段路径列表'),
  target: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe('目标字段路径'),
  when: z.string().optional().describe('条件表达式（何时应用 fulfill）'),
  fulfill: ReactionEffect.optional().describe('条件为真时应用的效果'),
  otherwise: ReactionEffect.optional().describe('条件为假时应用的效果'),
})

export type ReactionConfig = z.infer<typeof ReactionConfig>

export const ReactionSchema = z.object({
  type: z.enum(['linkage', 'effect', 'computed']).optional().describe('联动类型'),
  dependencies: z.array(z.string()).optional().describe('依赖的字段路径列表'),
  target: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe('目标字段路径'),
  when: z.string().optional().describe('条件表达式'),
  fulfill: ReactionEffect.optional().describe('条件为真时应用的效果'),
  otherwise: ReactionEffect.optional().describe('条件为假时应用的效果'),
  expression: z.string().optional().describe('计算值表达式'),
  executor: z.string().optional().describe('自定义联动执行器名称'),
})

export type ReactionSchema = z.infer<typeof ReactionSchema>

export const ReactionContext = z.object({
  $self: z.any().describe('当前字段值'),
  $deps: z.record(z.string(), z.any()).describe('依赖字段值'),
  $form: z.any().describe('表单实例引用'),
  $values: z.record(z.string(), z.any()).describe('所有表单值'),
  $path: z.string().describe('字段路径'),
  get $schema() {
    return FieldSchema.describe('字段 schema')
  },
  get $state() {
    return FieldState.describe('字段状态')
  },
})

export type ReactionContext = z.infer<typeof ReactionContext>

/**
 * ReactionEvaluator — kept as TypeScript type (function type).
 */
export type ReactionEvaluator = (expression: string, context: ReactionContext) => any

/**
 * ReactionExecutor — kept as TypeScript interface (contains methods).
 */
export interface ReactionExecutor {
  /** Executor name */
  name: string
  /** Executor function */
  execute: (context: ReactionContext, config: ReactionConfig) => void | Promise<void>
}
