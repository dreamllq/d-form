import { z } from 'zod'

export const colorPickerPropsSchema = z.object({
  showAlpha: z.boolean().optional().describe('是否支持透明度'),
  colorFormat: z.enum(['hex', 'rgb', 'hsl', 'hsv']).optional().describe('颜色格式'),
  size: z.enum(['large', 'default', 'small']).optional().describe('尺寸'),
  predefine: z.array(z.string()).optional().describe('预定义颜色'),
})

export type ColorPickerProps = z.infer<typeof colorPickerPropsSchema>
