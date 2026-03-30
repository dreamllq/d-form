import { z } from 'zod'

export const textareaPropsSchema = z.object({
  rows: z.number().int().positive().optional().describe('文本域行数'),
  autosize: z
    .union([
      z.boolean(),
      z.object({
        minRows: z.number().int().positive().optional().describe('最小行数'),
        maxRows: z.number().int().positive().optional().describe('最大行数'),
      }),
    ])
    .optional()
    .describe('是否自适应高度'),
  showWordLimit: z.boolean().optional().describe('是否显示字数统计'),
  maxlength: z.number().int().nonnegative().optional().describe('最大输入长度'),
  placeholder: z.string().optional().describe('占位文本'),
  readonly: z.boolean().optional().describe('是否只读'),
  resize: z.enum(['none', 'both', 'horizontal', 'vertical']).optional().describe('是否可缩放'),
})

export type TextareaProps = z.infer<typeof textareaPropsSchema>
