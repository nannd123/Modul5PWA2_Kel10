const STORAGE_KEY = 'bore_barrel_archived_products'
const DELETED_STORAGE_KEY = 'bore_barrel_permanently_deleted_products'
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

const readDeletedIds = () => {
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY)
    const ids = raw ? JSON.parse(raw) : []
    return Array.isArray(ids) ? ids : []
  } catch {
    return []
  }
}

const writeArchives = (archives) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(archives))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

const writeDeletedIds = (ids) => {
  localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(ids))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

const archiveService = {
  getArchives: readArchives,
  getPermanentlyDeletedIds: readDeletedIds,

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

  removePermanently(id) {
    writeArchives(readArchives().filter((item) => String(item.id) !== String(id)))
    const deletedIds = readDeletedIds()
    if (!deletedIds.some((deletedId) => String(deletedId) === String(id))) {
      writeDeletedIds([...deletedIds, id])
    }
  },

  subscribe(listener) {
    window.addEventListener(CHANGE_EVENT, listener)
    return () => window.removeEventListener(CHANGE_EVENT, listener)
  },
}

export default archiveService
