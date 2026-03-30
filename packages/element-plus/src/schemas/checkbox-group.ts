import { z } from 'zod'

const checkboxOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  disabled: z.boolean().optional(),
})

export const checkboxGroupPropsSchema = z.object({
  options: z.array(checkboxOptionSchema).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  size: z.enum(['large', 'default', 'small']).optional(),
  border: z.boolean().optional(),
})

export type CheckboxGroupProps = z.infer<typeof checkboxGroupPropsSchema>
