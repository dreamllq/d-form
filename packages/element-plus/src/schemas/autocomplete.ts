import { z } from 'zod'

export const autocompletePropsSchema = z.object({
  placeholder: z.string().optional(),
  clearable: z.boolean().optional(),
  triggerOnFocus: z.boolean().optional(),
  placement: z
    .enum(['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end'])
    .optional(),
  debounce: z.number().optional(),
  valueKey: z.string().optional(),
})

export type AutocompleteProps = z.infer<typeof autocompletePropsSchema>
