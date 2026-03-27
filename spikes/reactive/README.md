# Reactive System Spike Report

## Date
2026-03-27

## Purpose
Technical validation of reactive system design before implementing in @d-form/core.

## Files Created
```
spikes/reactive/
├── autorun.ts    # Reaction context tracking and autorun function
├── observable.ts # Proxy-based reactive wrapper
├── tracker.ts    # Dependency collection and notification
├── index.ts      # Entry point
├── test.ts       # Validation tests (tsx)
├── test.mjs      # Validation tests (node)
└── README.md     # This report
```

## Run Tests
```bash
# Option 1: Using tsx (no compilation needed)
cd spikes/reactive && npx tsx test.ts

# Option 2: Using node (requires compiled .js files)
node spikes/reactive/test.mjs
```

## Findings

### ✅ What Works
1. **Proxy-based observable**: JavaScript Proxy works for reactive property access
2. **autorun pattern**: Stack-based tracking correctly collects dependencies
3. **Dependency tracking**: Reading a property during autorun registers it as a dependency
4. **Change notification**: Setting a property triggers all dependent reactions

### ⚠️ Limitations of Spike
1. **No batching**: All reactions trigger immediately (production needs batch updates)
2. **No cleanup**: No disposal mechanism for reactions
3. **No computed values**: No memoization of derived state
4. **No nested observables**: Only flat objects supported
5. **No array support**: Arrays need special handling for length tracking

### 📋 Production Requirements
1. Implement `batch()` for batching multiple updates
2. Add `reaction.dispose()` for cleanup
3. Add `computed()` for derived values with caching
4. Add nested observable support (deep reactivity)
5. Add array mutation tracking (push, pop, etc.)
6. Consider using WeakMap for memory management
7. Add proper TypeScript types for observable objects
8. Add cycle detection to prevent infinite loops

## Architecture
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  observable │────▶│   autorun   │────▶│   Tracker   │
│   (Proxy)   │     │   (Stack)   │     │   (Set)     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │   get → track     │   push/pop        │
       │   set → notify    │   context         │
       └───────────────────┴───────────────────┘
```

## References
- Formily reactive: https://github.com/alibaba/formily/tree/formily_next/packages/reactive
- Vue reactivity: https://github.com/vuejs/core/tree/main/packages/reactivity/src
- MobX: https://github.com/mobxjs/mobx

## Decision
**PROCEED** with implementing production reactive system in `packages/core/src/reactive/`.

The spike validates that:
- Stack-based dependency tracking is viable
- Proxy interception works for reactivity
- The basic reactive flow is correct
