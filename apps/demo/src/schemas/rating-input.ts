import { z } from 'zod'

export const ratingInputPropsSchema = z.object({
  max: z.number().optional(),
  allowHalf: z.boolean().optional(),
  showScore: z.boolean().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
})

export type RatingInputProps = z.infer<typeof ratingInputPropsSchema>
