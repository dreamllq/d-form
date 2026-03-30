import { z } from 'zod'

export const treeSelectPropsSchema = z.object({
  data: z.array(z.record(z.string(), z.any())).optional(),
  props: z.record(z.string(), z.any()).optional(),
  placeholder: z.string().optional(),
  clearable: z.boolean().optional(),
  multiple: z.boolean().optional(),
  checkStrictly: z.boolean().optional(),
  renderAfterExpand: z.boolean().optional(),
  lazy: z.boolean().optional(),
  nodeKey: z.string().optional(),
})

export type TreeSelectProps = z.infer<typeof treeSelectPropsSchema>
