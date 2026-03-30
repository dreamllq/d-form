import { z } from 'zod'

export const inputNumberPropsSchema = z.object({
  min: z.number().optional().describe('最小值'),
  max: z.number().optional().describe('最大值'),
  step: z.number().optional().describe('步长'),
  precision: z.number().int().nonnegative().optional().describe('数值精度'),
  size: z.enum(['large', 'default', 'small']).optional().describe('尺寸'),
  controls: z.boolean().optional().describe('是否显示控制按钮'),
  controlsPosition: z.enum(['', 'right']).optional().describe('控制按钮位置'),
  placeholder: z.string().optional().describe('占位文本'),
})

export type InputNumberProps = z.infer<typeof inputNumberPropsSchema>
