import { z } from 'zod'

export const ratePropsSchema = z.object({
  max: z.number().optional().describe('最大分值'),
  allowHalf: z.boolean().optional().describe('是否允许半选'),
  showScore: z.boolean().optional().describe('是否显示分数'),
  showText: z.boolean().optional().describe('是否显示辅助文字'),
  scoreTemplate: z.string().optional().describe('分数显示模板'),
  colors: z.array(z.string()).optional().describe('图标颜色'),
})

export type RateProps = z.infer<typeof ratePropsSchema>
