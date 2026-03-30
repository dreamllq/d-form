import { z } from 'zod'

export const inputPropsSchema = z.object({
  placeholder: z.string().optional().describe('输入框占位文本'),
  maxlength: z.number().optional().describe('最大输入长度'),
  minlength: z.number().optional().describe('最小输入长度'),
  clearable: z.boolean().optional().describe('是否可清空'),
  showWordLimit: z.boolean().optional().describe('是否显示字数统计'),
  showPassword: z.boolean().optional().describe('是否显示密码切换按钮'),
  size: z.enum(['large', 'default', 'small']).optional().describe('输入框尺寸'),
  type: z
    .enum(['text', 'textarea', 'password', 'number', 'tel', 'email', 'url'])
    .optional()
    .describe('输入框类型'),
  prefixIcon: z.string().optional().describe('前缀图标'),
  suffixIcon: z.string().optional().describe('后缀图标'),
  readonly: z.boolean().optional().describe('是否只读'),
  autocomplete: z.string().optional().describe('自动补全'),
  tabindex: z.string().optional().describe('Tab 键顺序'),
  validateEvent: z.boolean().optional().describe('是否触发表单验证'),
})

export type InputProps = z.infer<typeof inputPropsSchema>
