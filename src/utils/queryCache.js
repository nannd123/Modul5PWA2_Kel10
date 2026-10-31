const cache = new Map()
const versions = new Map()
let cacheEpoch = 0

export const getCachedQuery = async (key, fetcher, { staleTime = 30_000, force = false } = {}) => {
  const cached = cache.get(key)
  if (!force && cached?.value !== undefined && Date.now() - cached.updatedAt < staleTime) {
    return cached.value
  }
  if (!force && cached?.promise) return cached.promise

  const version = versions.get(key) || 0
  const epoch = cacheEpoch
  const promise = fetcher()
    .then((value) => {
      if (epoch === cacheEpoch && version === (versions.get(key) || 0) && cache.get(key)?.promise === promise) {
        cache.set(key, { value, updatedAt: Date.now() })
      }
      return value
    })
    .catch((error) => {
      if (cache.get(key)?.promise === promise) cache.delete(key)
      throw error
    })
  cache.set(key, { ...cached, promise })
  return promise
}

export const invalidateQuery = (key) => {
  if (key) {
    cache.delete(key)
    versions.set(key, (versions.get(key) || 0) + 1)
    return
  }
  cache.clear()
  versions.clear()
  cacheEpoch += 1
}
