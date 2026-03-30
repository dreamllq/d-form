import { z } from 'zod'

export const switchPropsSchema = z.object({
  activeValue: z.union([z.string(), z.number(), z.boolean()]).optional().describe('打开时的值'),
  inactiveValue: z.union([z.string(), z.number(), z.boolean()]).optional().describe('关闭时的值'),
  activeText: z.string().optional().describe('打开时的文字'),
  inactiveText: z.string().optional().describe('关闭时的文字'),
  activeColor: z.string().optional().describe('打开时的背景色'),
  inactiveColor: z.string().optional().describe('关闭时的背景色'),
  width: z.number().optional().describe('宽度'),
  inlinePrompt: z.boolean().optional().describe('是否内联显示文字'),
  size: z.enum(['large', 'default', 'small']).optional().describe('尺寸'),
})

export type SwitchProps = z.infer<typeof switchPropsSchema>
