const STORAGE_KEY = 'bore_barrel_archived_products'
const CHANGE_EVENT = 'bore-barrel-archives-changed'

const readArchives = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const archives = raw ? JSON.parse(raw) : []
    return Array.isArray(archives) ? archives : []
  } catch {
    return []
  }
}

const writeArchives = (archives) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(archives))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

const archiveService = {
  getArchives: readArchives,

  isArchived(id) {
    return readArchives().some((item) => String(item.id) === String(id))
  },

  archiveProduct(product) {
    if (!product?.id) throw new Error('A product ID is required to archive it.')
    const archives = readArchives().filter((item) => String(item.id) !== String(product.id))
    writeArchives([...archives, { ...product, archivedAt: new Date().toISOString() }])
  },

  restoreProduct(id) {
    writeArchives(readArchives().filter((item) => String(item.id) !== String(id)))
  },

  subscribe(listener) {
    window.addEventListener(CHANGE_EVENT, listener)
    return () => window.removeEventListener(CHANGE_EVENT, listener)
  },
}

export default archiveService
