import { z } from 'zod'

const selectOptionSchema = z.object({
  label: z.string().describe('选项标签'),
  value: z.union([z.string(), z.number()]).describe('选项值'),
  disabled: z.boolean().optional().describe('是否禁用'),
})

export const selectPropsSchema = z.object({
  placeholder: z.string().optional().describe('占位文本'),
  clearable: z.boolean().optional().describe('是否可清空'),
  multiple: z.boolean().optional().describe('是否多选'),
  filterable: z.boolean().optional().describe('是否可搜索'),
  remote: z.boolean().optional().describe('是否远程搜索'),
  loading: z.boolean().optional().describe('是否正在加载'),
  options: z.array(selectOptionSchema).optional().describe('选项列表'),
  multipleLimit: z.number().optional().describe('多选限制数量'),
  collapseTags: z.boolean().optional().describe('是否折叠标签'),
  collapseTagsTooltip: z.boolean().optional().describe('折叠标签是否显示提示'),
  reserveKeyword: z.boolean().optional().describe('多选是否保留搜索关键词'),
  fitInputWidth: z.boolean().optional().describe('下拉框宽度是否适应输入框'),
  size: z.enum(['large', 'default', 'small']).optional().describe('尺寸'),
  effect: z.enum(['dark', 'light']).optional().describe('下拉菜单主题'),
  placement: z
    .enum(['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end'])
    .optional()
    .describe('下拉菜单弹出位置'),
})

export type SelectProps = z.infer<typeof selectPropsSchema>
