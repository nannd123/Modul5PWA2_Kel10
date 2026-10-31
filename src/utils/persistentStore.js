const clone = (value) => JSON.parse(JSON.stringify(value))

export function createPersistentStore(key, initialValue, { validate = () => true } = {}) {
  const fallbackValue = clone(initialValue)
  let value = fallbackValue
  const listeners = new Set()

  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      const parsed = JSON.parse(stored)
      if (validate(parsed)) {
        value = parsed
      } else {
        console.warn(`[persistentStore] Ignoring invalid stored value for "${key}".`)
      }
    }
  } catch (error) {
    console.warn(`[persistentStore] Could not read "${key}" from localStorage.`, error)
  }

  const notify = () => listeners.forEach((listener) => listener())

  return {
    get: () => value,
    getServerSnapshot: () => fallbackValue,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    set(nextValue) {
      const updated = typeof nextValue === 'function' ? nextValue(value) : nextValue
      if (!validate(updated)) {
        throw new TypeError(`Invalid value for persistent store "${key}".`)
      }

      const serialized = JSON.stringify(updated)
      try {
        localStorage.setItem(key, serialized)
      } catch (error) {
        throw new Error(`Could not save "${key}" to localStorage: ${error.message}`)
      }

      value = updated
      notify()
      return value
    },
  }
}
