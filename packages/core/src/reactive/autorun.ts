/**
 * Reaction context tracking and autorun function
 */

import { getPropertyTracker } from './tracker'

const reactionStack: (() => void)[] = []

export function getCurrentReaction(): (() => void) | undefined {
  return reactionStack[reactionStack.length - 1]
}

export function autorun(runner: () => void): () => void {
  const execute = () => {
    reactionStack.push(execute)
    try {
      runner()
    } finally {
      reactionStack.pop()
    }
  }
  
  execute()
  
  // Return dispose function
  return () => {
    // Could implement cleanup here if needed
  }
}

export function trackAccess(objId: symbol, prop: string): void {
  const reaction = getCurrentReaction()
  if (reaction) {
    const tracker = getPropertyTracker(objId, prop)
    tracker.add(reaction)
  }
}

export function trackChange(objId: symbol, prop: string): void {
  const tracker = getPropertyTracker(objId, prop)
  tracker.notify()
}
