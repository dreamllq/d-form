import { z } from 'zod'

export const uploadPropsSchema = z.object({
  action: z.string().optional(),
  multiple: z.boolean().optional(),
  drag: z.boolean().optional(),
  accept: z.string().optional(),
  listType: z.enum(['text', 'picture', 'picture-card']).optional(),
  autoUpload: z.boolean().optional(),
  limit: z.number().optional(),
  data: z.record(z.string(), z.any()).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  name: z.string().optional(),
  withCredentials: z.boolean().optional(),
})

export type UploadProps = z.infer<typeof uploadPropsSchema>
