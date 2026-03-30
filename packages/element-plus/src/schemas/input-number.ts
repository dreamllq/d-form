import { z } from 'zod'

export const inputNumberPropsSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  precision: z.number().int().nonnegative().optional(),
  size: z.enum(['large', 'default', 'small']).optional(),
  controls: z.boolean().optional(),
  controlsPosition: z.enum(['', 'right']).optional(),
  placeholder: z.string().optional(),
})

export type InputNumberProps = z.infer<typeof inputNumberPropsSchema>
