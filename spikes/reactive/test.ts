import { autorun, observable, clearAllTrackers } from './index'

clearAllTrackers()

console.log('Testing Reactive System Spike...\n')

let result = 0
const data = observable({ count: 0 })

console.log('Test 1: Basic autorun')
autorun(() => {
  result = data.count * 2
})
console.log(`  Initial result: ${result}`)
if (result !== 0) {
  console.error('  FAIL: Expected 0, got', result)
  process.exit(1)
}
console.log('  ✓ Initial autorun works')

console.log('\nTest 2: Reactive update')
data.count = 5
console.log(`  After update result: ${result}`)
if (result !== 10) {
  console.error('  FAIL: Expected 10, got', result)
  process.exit(1)
}
console.log('  ✓ Reactive update works')

console.log('\nTest 3: Multiple updates')
data.count = 3
console.log(`  After second update result: ${result}`)
if (result !== 6) {
  console.error('  FAIL: Expected 6, got', result)
  process.exit(1)
}
console.log('  ✓ Multiple updates work')

console.log('\nTest 4: Multiple properties')
clearAllTrackers()
const user = observable({ firstName: 'John', lastName: 'Doe', fullName: '' })
autorun(() => {
  user.fullName = `${user.firstName} ${user.lastName}`
})
console.log(`  Initial fullName: ${user.fullName}`)
if (user.fullName !== 'John Doe') {
  console.error('  FAIL: Expected "John Doe", got', user.fullName)
  process.exit(1)
}

user.firstName = 'Jane'
console.log(`  After firstName change: ${user.fullName}`)
if (user.fullName !== 'Jane Doe') {
  console.error('  FAIL: Expected "Jane Doe", got', user.fullName)
  process.exit(1)
}
console.log('  ✓ Multiple properties work')

console.log('\n✅ All spike tests passed!')
console.log('\nSpike Report:')
console.log('  - autorun: Works for automatic dependency tracking')
console.log('  - observable: Works with Proxy for reactivity')
console.log('  - Tracker: Works for collecting dependencies')
console.log('\nNext: Implement production version in packages/core/src/reactive/')
