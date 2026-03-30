import { z } from 'zod'

const radioOptionSchema = z.object({
  label: z.string().describe('选项标签'),
  value: z.union([z.string(), z.number()]).describe('选项值'),
  disabled: z.boolean().optional().describe('是否禁用'),
})

export const radioPropsSchema = z.object({
  options: z.array(radioOptionSchema).optional().describe('选项列表'),
  border: z.boolean().optional().describe('是否显示边框'),
  size: z.enum(['large', 'default', 'small']).optional().describe('尺寸'),
})

export type RadioProps = z.infer<typeof radioPropsSchema>
