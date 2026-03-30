import { z } from 'zod'

export const sliderPropsSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  range: z.boolean().optional(),
  showInput: z.boolean().optional(),
  showStops: z.boolean().optional(),
  showTooltip: z.boolean().optional(),
})

export type SliderProps = z.infer<typeof sliderPropsSchema>
