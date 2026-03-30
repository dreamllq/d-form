import { z } from 'zod'

const cascaderOptionSchema: z.ZodType<{
  label: string
  value: string | number
  children?: Array<{
    label: string
    value: string | number
    children?: unknown[]
  }>
}> = z.object({
  label: z.string().describe('选项标签'),
  value: z.union([z.string(), z.number()]).describe('选项值'),
  children: z
    .lazy(() => cascaderOptionSchema.array())
    .optional()
    .describe('子选项'),
})

export const cascaderPropsSchema = z.object({
  options: cascaderOptionSchema.array().optional().describe('选项列表'),
  props: z.record(z.string(), z.any()).optional().describe('级联面板配置'),
  placeholder: z.string().optional().describe('占位文本'),
  clearable: z.boolean().optional().describe('是否可清空'),
  filterable: z.boolean().optional().describe('是否可搜索'),
  multiple: z.boolean().optional().describe('是否多选'),
  separator: z.string().optional().describe('选项分隔符'),
  showAllLevels: z.boolean().optional().describe('是否显示完整路径'),
})

export type CascaderProps = z.infer<typeof cascaderPropsSchema>
