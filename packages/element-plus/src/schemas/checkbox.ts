import { z } from 'zod'

export const checkboxPropsSchema = z.object({
  label: z.string().optional(),
  trueValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  falseValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  border: z.boolean().optional(),
  size: z.enum(['large', 'default', 'small']).optional(),
  checked: z.boolean().optional(),
  indeterminate: z.boolean().optional(),
})

export type CheckboxProps = z.infer<typeof checkboxPropsSchema>
