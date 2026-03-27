/**
 * SPIKE: Reactive System - Observable
 * Technical validation, NOT production code
 */
import { trackAccess, trackChange } from './autorun.js';
const objectIdMap = new WeakMap();
function getObjectId(obj) {
    let id = objectIdMap.get(obj);
    if (!id) {
        id = Symbol();
        objectIdMap.set(obj, id);
    }
    return id;
}
export function observable(target) {
    const objId = getObjectId(target);
    return new Proxy(target, {
        get(obj, prop) {
            const value = obj[prop];
            trackAccess(objId, prop);
            return value;
        },
        set(obj, prop, value) {
            const oldValue = obj[prop];
            if (oldValue !== value) {
                obj[prop] = value;
                trackChange(objId, prop);
            }
            return true;
        }
    });
}
