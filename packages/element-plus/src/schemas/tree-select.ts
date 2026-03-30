import { z } from 'zod'

export const treeSelectPropsSchema = z.object({
  data: z.array(z.record(z.string(), z.any())).optional().describe('树形数据'),
  props: z.record(z.string(), z.any()).optional().describe('树形组件配置'),
  placeholder: z.string().optional().describe('占位文本'),
  clearable: z.boolean().optional().describe('是否可清空'),
  multiple: z.boolean().optional().describe('是否多选'),
  checkStrictly: z.boolean().optional().describe('是否严格的父子不关联'),
  renderAfterExpand: z.boolean().optional().describe('是否展开后才渲染子节点'),
  lazy: z.boolean().optional().describe('是否懒加载'),
  nodeKey: z.string().optional().describe('节点唯一标识'),
})

export type TreeSelectProps = z.infer<typeof treeSelectPropsSchema>
