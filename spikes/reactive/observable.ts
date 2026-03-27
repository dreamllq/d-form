/**
 * SPIKE: Reactive System - Observable
 * Technical validation, NOT production code
 */

import { trackAccess, trackChange } from './autorun'

const objectIdMap = new WeakMap<object, symbol>()

function getObjectId(obj: object): symbol {
  let id = objectIdMap.get(obj)
  if (!id) {
    id = Symbol()
    objectIdMap.set(obj, id)
  }
  return id
}

export function observable<T extends object>(target: T): T {
  const objId = getObjectId(target)
  
  return new Proxy(target, {
    get(obj, prop: string) {
      const value = (obj as any)[prop]
      trackAccess(objId, prop)
      return value
    },
    
    set(obj, prop: string, value) {
      const oldValue = (obj as any)[prop]
      if (oldValue !== value) {
        (obj as any)[prop] = value
        trackChange(objId, prop)
      }
      return true
    }
  })
}
