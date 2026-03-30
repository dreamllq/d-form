import { z } from 'zod'

export const colorPickerPropsSchema = z.object({
  showAlpha: z.boolean().optional(),
  colorFormat: z.enum(['hex', 'rgb', 'hsl', 'hsv']).optional(),
  size: z.enum(['large', 'default', 'small']).optional(),
  predefine: z.array(z.string()).optional(),
})

export type ColorPickerProps = z.infer<typeof colorPickerPropsSchema>
