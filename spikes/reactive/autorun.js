/**
 * SPIKE: Reactive System - Autorun
 * Technical validation, NOT production code
 */
import { getPropertyTracker } from './tracker.js';
const reactionStack = [];
export function getCurrentReaction() {
    return reactionStack[reactionStack.length - 1];
}
export function autorun(runner) {
    const execute = () => {
        reactionStack.push(execute);
        try {
            runner();
        }
        finally {
            reactionStack.pop();
        }
    };
    execute();
    return () => { };
}
export function trackAccess(objId, prop) {
    const reaction = getCurrentReaction();
    if (reaction) {
        const tracker = getPropertyTracker(objId, prop);
        tracker.add(reaction);
    }
}
export function trackChange(objId, prop) {
    const tracker = getPropertyTracker(objId, prop);
    tracker.notify();
}
