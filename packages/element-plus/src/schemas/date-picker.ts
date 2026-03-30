import { z } from 'zod'

export const datePickerPropsSchema = z.object({
  type: z
    .enum(['date', 'datetime', 'week', 'month', 'year', 'daterange'])
    .optional()
    .describe('日期选择器类型'),
  format: z.string().optional().describe('显示格式'),
  valueFormat: z.string().optional().describe('绑定值格式'),
  placeholder: z.string().optional().describe('占位文本'),
  clearable: z.boolean().optional().describe('是否可清空'),
  startPlaceholder: z.string().optional().describe('范围选择开始占位文本'),
  endPlaceholder: z.string().optional().describe('范围选择结束占位文本'),
  rangeSeparator: z.string().optional().describe('范围分隔符'),
  size: z.enum(['large', 'default', 'small']).optional().describe('尺寸'),
  editable: z.boolean().optional().describe('是否可输入'),
  readonly: z.boolean().optional().describe('是否只读'),
})

export type DatePickerProps = z.infer<typeof datePickerPropsSchema>
