import { z } from 'zod'

export const textareaPropsSchema = z.object({
  rows: z.number().int().positive().optional(),
  autosize: z
    .union([
      z.boolean(),
      z.object({
        minRows: z.number().int().positive().optional(),
        maxRows: z.number().int().positive().optional(),
      }),
    ])
    .optional(),
  showWordLimit: z.boolean().optional(),
  maxlength: z.number().int().nonnegative().optional(),
  placeholder: z.string().optional(),
  readonly: z.boolean().optional(),
  resize: z.enum(['none', 'both', 'horizontal', 'vertical']).optional(),
})

export type TextareaProps = z.infer<typeof textareaPropsSchema>
