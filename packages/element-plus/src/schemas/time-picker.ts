import { z } from 'zod'

export const timePickerPropsSchema = z.object({
  placeholder: z.string().optional().describe('占位文本'),
  clearable: z.boolean().optional().describe('是否可清空'),
  format: z.string().optional().describe('显示格式'),
  valueFormat: z.string().optional().describe('绑定值格式'),
  isRange: z.boolean().optional().describe('是否为范围选择'),
})

export type TimePickerProps = z.infer<typeof timePickerPropsSchema>
