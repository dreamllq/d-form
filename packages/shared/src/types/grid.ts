/**
 * Grid types for d-form
 */

import { z } from 'zod'

export const GridConfig = z.object({
  maxColumns: z.number().optional().describe('最大列数'),
  minColumns: z.number().optional().describe('最小列数'),
  minColumnWidth: z.number().optional().describe('最小列宽'),
  maxColumnWidth: z.number().optional().describe('最大列宽'),
  columnGap: z.number().optional().describe('列间距'),
  rowGap: z.number().optional().describe('行间距'),
  colWrap: z.boolean().optional().describe('是否换行'),
})

export type GridConfig = z.infer<typeof GridConfig>
