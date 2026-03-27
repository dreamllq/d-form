/**
 * SPIKE: Reactive System - Dependency Collection
 * Technical validation, NOT production code
 */
export class Tracker {
    constructor() {
        this.effects = new Set();
    }
    add(effect) {
        this.effects.add(effect);
    }
    notify() {
        this.effects.forEach(effect => {
            try {
                effect();
            }
            catch (error) {
                console.error('Reaction error:', error);
            }
        });
    }
    clear() {
        this.effects.clear();
    }
    get size() {
        return this.effects.size;
    }
}
const trackerMap = new Map();
export function getPropertyTracker(objId, prop) {
    const key = `${objId.toString()}:${prop}`;
    let tracker = trackerMap.get(key);
    if (!tracker) {
        tracker = new Tracker();
        trackerMap.set(key, tracker);
    }
    return tracker;
}
export function clearAllTrackers() {
    trackerMap.clear();
}
