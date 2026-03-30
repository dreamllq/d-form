import { z } from 'zod'

export const ratePropsSchema = z.object({
  max: z.number().optional(),
  allowHalf: z.boolean().optional(),
  showScore: z.boolean().optional(),
  showText: z.boolean().optional(),
  scoreTemplate: z.string().optional(),
  colors: z.array(z.string()).optional(),
})

export type RateProps = z.infer<typeof ratePropsSchema>
