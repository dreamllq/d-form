import { defineComponentRegistry } from '@d-form/shared'
import { ratingInputPropsSchema } from './rating-input'

export const customRegistry = defineComponentRegistry({
  'rating-input': ratingInputPropsSchema,
})
