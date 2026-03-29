/**
 * Grid types for d-form
 */

import { z } from 'zod'

export const GridConfig = z.object({
  maxColumns: z.number().optional(),
  minColumns: z.number().optional(),
  minColumnWidth: z.number().optional(),
  maxColumnWidth: z.number().optional(),
  columnGap: z.number().optional(),
  rowGap: z.number().optional(),
  colWrap: z.boolean().optional(),
})

export type GridConfig = z.infer<typeof GridConfig>
