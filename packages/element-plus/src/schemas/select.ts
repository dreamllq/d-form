import { z } from 'zod'

const selectOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  disabled: z.boolean().optional(),
})

export const selectPropsSchema = z.object({
  placeholder: z.string().optional(),
  clearable: z.boolean().optional(),
  multiple: z.boolean().optional(),
  filterable: z.boolean().optional(),
  remote: z.boolean().optional(),
  loading: z.boolean().optional(),
  options: z.array(selectOptionSchema).optional(),
  multipleLimit: z.number().optional(),
  collapseTags: z.boolean().optional(),
  collapseTagsTooltip: z.boolean().optional(),
  reserveKeyword: z.boolean().optional(),
  fitInputWidth: z.boolean().optional(),
  size: z.enum(['large', 'default', 'small']).optional(),
  effect: z.enum(['dark', 'light']).optional(),
  placement: z
    .enum(['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end'])
    .optional(),
})

export type SelectProps = z.infer<typeof selectPropsSchema>
