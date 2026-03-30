import { z } from 'zod'

export const timeSelectPropsSchema = z.object({
  placeholder: z.string().optional().describe('占位文本'),
  clearable: z.boolean().optional().describe('是否可清空'),
  start: z.string().optional().describe('开始时间'),
  end: z.string().optional().describe('结束时间'),
  step: z.string().optional().describe('时间间隔'),
  minTime: z.string().optional().describe('最小时间'),
  maxTime: z.string().optional().describe('最大时间'),
})

export type TimeSelectProps = z.infer<typeof timeSelectPropsSchema>
