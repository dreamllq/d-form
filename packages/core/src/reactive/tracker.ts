/**
 * Dependency tracking and notification system
 */

export class Tracker {
  private effects = new Set<() => void>()

  add(effect: () => void): void {
    this.effects.add(effect)
  }

  notify(): void {
    this.effects.forEach(effect => {
      try {
        effect()
      } catch (error) {
        console.error('Reaction error:', error)
      }
    })
  }

  clear(): void {
    this.effects.clear()
  }

  get size(): number {
    return this.effects.size
  }
}

const trackerMap = new Map<string, Tracker>()

export function getPropertyTracker(objId: symbol, prop: string): Tracker {
  const key = `${objId.toString()}:${prop}`
  let tracker = trackerMap.get(key)
  if (!tracker) {
    tracker = new Tracker()
    trackerMap.set(key, tracker)
  }
  return tracker
}

export function clearAllTrackers(): void {
  trackerMap.clear()
}
