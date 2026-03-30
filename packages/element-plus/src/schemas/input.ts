import { z } from 'zod'

export const inputPropsSchema = z.object({
  placeholder: z.string().optional(),
  maxlength: z.number().optional(),
  minlength: z.number().optional(),
  clearable: z.boolean().optional(),
  showWordLimit: z.boolean().optional(),
  showPassword: z.boolean().optional(),
  size: z.enum(['large', 'default', 'small']).optional(),
  type: z.enum(['text', 'textarea', 'password', 'number', 'tel', 'email', 'url']).optional(),
  prefixIcon: z.string().optional(),
  suffixIcon: z.string().optional(),
  readonly: z.boolean().optional(),
  autocomplete: z.string().optional(),
  tabindex: z.string().optional(),
  validateEvent: z.boolean().optional(),
})

export type InputProps = z.infer<typeof inputPropsSchema>
