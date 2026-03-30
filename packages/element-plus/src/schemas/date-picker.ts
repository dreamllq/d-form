import { z } from 'zod'

export const datePickerPropsSchema = z.object({
  type: z.enum(['date', 'datetime', 'week', 'month', 'year', 'daterange']).optional(),
  format: z.string().optional(),
  valueFormat: z.string().optional(),
  placeholder: z.string().optional(),
  clearable: z.boolean().optional(),
  startPlaceholder: z.string().optional(),
  endPlaceholder: z.string().optional(),
  rangeSeparator: z.string().optional(),
  size: z.enum(['large', 'default', 'small']).optional(),
  editable: z.boolean().optional(),
  readonly: z.boolean().optional(),
})

export type DatePickerProps = z.infer<typeof datePickerPropsSchema>
