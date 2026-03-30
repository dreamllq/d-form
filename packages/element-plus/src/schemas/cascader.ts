import { z } from 'zod'

const cascaderOptionSchema: z.ZodType<{
  label: string
  value: string | number
  children?: Array<{
    label: string
    value: string | number
    children?: unknown[]
  }>
}> = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  children: z.lazy(() => cascaderOptionSchema.array()).optional(),
})

export const cascaderPropsSchema = z.object({
  options: cascaderOptionSchema.array().optional(),
  props: z.record(z.string(), z.any()).optional(),
  placeholder: z.string().optional(),
  clearable: z.boolean().optional(),
  filterable: z.boolean().optional(),
  multiple: z.boolean().optional(),
  separator: z.string().optional(),
  showAllLevels: z.boolean().optional(),
})

export type CascaderProps = z.infer<typeof cascaderPropsSchema>
