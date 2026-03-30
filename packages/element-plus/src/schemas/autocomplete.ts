import { z } from 'zod'

export const autocompletePropsSchema = z.object({
  placeholder: z.string().optional().describe('占位文本'),
  clearable: z.boolean().optional().describe('是否可清空'),
  triggerOnFocus: z.boolean().optional().describe('聚焦时是否触发建议'),
  placement: z
    .enum(['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end'])
    .optional()
    .describe('弹出位置'),
  debounce: z.number().optional().describe('防抖延迟（毫秒）'),
  valueKey: z.string().optional().describe('输入建议对象中用于显示的键名'),
})

export type AutocompleteProps = z.infer<typeof autocompletePropsSchema>
