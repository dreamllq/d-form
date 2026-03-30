import { z } from 'zod'

const radioOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  disabled: z.boolean().optional(),
})

export const radioPropsSchema = z.object({
  options: z.array(radioOptionSchema).optional(),
  border: z.boolean().optional(),
  size: z.enum(['large', 'default', 'small']).optional(),
})

export type RadioProps = z.infer<typeof radioPropsSchema>
