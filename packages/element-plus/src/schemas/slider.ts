import { z } from 'zod'

export const sliderPropsSchema = z.object({
  min: z.number().optional().describe('最小值'),
  max: z.number().optional().describe('最大值'),
  step: z.number().optional().describe('步长'),
  range: z.boolean().optional().describe('是否为范围选择'),
  showInput: z.boolean().optional().describe('是否显示数字输入框'),
  showStops: z.boolean().optional().describe('是否显示断点'),
  showTooltip: z.boolean().optional().describe('是否显示提示'),
})

export type SliderProps = z.infer<typeof sliderPropsSchema>
