import { z } from 'zod'

export const uploadPropsSchema = z.object({
  action: z.string().optional().describe('上传地址'),
  multiple: z.boolean().optional().describe('是否支持多选'),
  drag: z.boolean().optional().describe('是否启用拖拽上传'),
  accept: z.string().optional().describe('接受的文件类型'),
  listType: z.enum(['text', 'picture', 'picture-card']).optional().describe('文件列表类型'),
  autoUpload: z.boolean().optional().describe('是否自动上传'),
  limit: z.number().optional().describe('最大允许上传数量'),
  data: z.record(z.string(), z.any()).optional().describe('上传附加参数'),
  headers: z.record(z.string(), z.string()).optional().describe('上传请求头'),
  name: z.string().optional().describe('上传文件字段名'),
  withCredentials: z.boolean().optional().describe('是否携带 Cookie'),
})

export type UploadProps = z.infer<typeof uploadPropsSchema>
