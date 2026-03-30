import { z } from 'zod'

export const checkboxPropsSchema = z.object({
  label: z.string().optional().describe('复选框标签'),
  trueValue: z.union([z.string(), z.number(), z.boolean()]).optional().describe('选中时的值'),
  falseValue: z.union([z.string(), z.number(), z.boolean()]).optional().describe('未选中时的值'),
  border: z.boolean().optional().describe('是否显示边框'),
  size: z.enum(['large', 'default', 'small']).optional().describe('尺寸'),
  checked: z.boolean().optional().describe('是否选中'),
  indeterminate: z.boolean().optional().describe('是否半选状态'),
})

export type CheckboxProps = z.infer<typeof checkboxPropsSchema>
