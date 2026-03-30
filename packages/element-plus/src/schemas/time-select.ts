import { z } from 'zod'

export const timeSelectPropsSchema = z.object({
  placeholder: z.string().optional(),
  clearable: z.boolean().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  step: z.string().optional(),
  minTime: z.string().optional(),
  maxTime: z.string().optional(),
})

export type TimeSelectProps = z.infer<typeof timeSelectPropsSchema>
