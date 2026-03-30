import { z } from 'zod'

export const timePickerPropsSchema = z.object({
  placeholder: z.string().optional(),
  clearable: z.boolean().optional(),
  format: z.string().optional(),
  valueFormat: z.string().optional(),
  isRange: z.boolean().optional(),
})

export type TimePickerProps = z.infer<typeof timePickerPropsSchema>
