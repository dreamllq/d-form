import { z } from 'zod'

export const switchPropsSchema = z.object({
  activeValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  inactiveValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  activeText: z.string().optional(),
  inactiveText: z.string().optional(),
  activeColor: z.string().optional(),
  inactiveColor: z.string().optional(),
  width: z.number().optional(),
  inlinePrompt: z.boolean().optional(),
  size: z.enum(['large', 'default', 'small']).optional(),
})

export type SwitchProps = z.infer<typeof switchPropsSchema>
