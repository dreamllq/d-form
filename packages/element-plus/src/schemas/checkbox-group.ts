import { z } from 'zod'

const checkboxOptionSchema = z.object({
  label: z.string().describe('选项标签'),
  value: z.union([z.string(), z.number()]).describe('选项值'),
  disabled: z.boolean().optional().describe('是否禁用'),
})

export const checkboxGroupPropsSchema = z.object({
  options: z.array(checkboxOptionSchema).optional().describe('选项列表'),
  min: z.number().optional().describe('最小选中数'),
  max: z.number().optional().describe('最大选中数'),
  size: z.enum(['large', 'default', 'small']).optional().describe('尺寸'),
  border: z.boolean().optional().describe('是否显示边框'),
})

export type CheckboxGroupProps = z.infer<typeof checkboxGroupPropsSchema>
