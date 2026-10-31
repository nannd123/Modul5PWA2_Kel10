import { useState, useMemo, useEffect } from 'react'
import { RefreshCw, Plus, Loader, PackageOpen } from 'lucide-react'
import { useGuns } from '../hooks/useGuns'
import { API_CONFIGURED } from '../config/api'
import GUNS_LOCAL from '../data/guns'
import GunCard from '../components/gun/GunCard'
import GunDetail from '../components/gun/GunDetail'
import AdvancedFilter from '../components/common/AdvancedFilter'
import ConfirmModal from '../components/modals/ConfirmModal'
import archiveService from '../services/archiveService'
import { toDisplayMessage } from '../utils/helpers'
import {
  matchesSearch,
  matchesCategory,
  sortItems,
  extractCategories,
} from '../utils/helpers'

/**
 * Catalog page — the main product listing.
 *
 * Data source priority:
 *   1. Live API via useGuns()
 *   2. Local static array (GUNS_LOCAL) when the API is unreachable
 *
 * Features: search, category filter, sort, CRUD actions, detail modal.
 */
export default function Catalog({ onNavigate }) {
  // ---- API data ----
  const { guns: apiGuns, loading, error, refetch } = useGuns({ limit: 50 })
  // Missing backend or failed initial fetch: show demo data automatically.
  const isLocalMode = !API_CONFIGURED || Boolean(error && apiGuns.length === 0)

  // Decide data source
  const rawGuns = useMemo(() => {
    if (isLocalMode) {
      // Enrich local data with synthetic ids so FavoriteButton and detail work
      return GUNS_LOCAL.map((g, i) => ({ ...g, id: g.id || `local-${i}` }))
    }
    return apiGuns
  }, [apiGuns, isLocalMode])

  // ---- filters / sort ----
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [archives, setArchives] = useState(archiveService.getArchives)

  const categories = useMemo(() => extractCategories(rawGuns), [rawGuns])

  const filteredGuns = useMemo(() => {
    let result = rawGuns.filter(
      (g) => matchesSearch(g, search) && matchesCategory(g, activeCategory),
    )
    return sortItems(result, sortKey, sortOrder)
  }, [rawGuns, search, activeCategory, sortKey, sortOrder])
  const visibleGuns = useMemo(
    () => filteredGuns.filter((gun) => !archives.some((item) => String(item.id) === String(gun.id))),
    [filteredGuns, archives],
  )

  // ---- detail view ----
  const [selectedGun, setSelectedGun] = useState(null)

  // ---- delete ----
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => archiveService.subscribe(() => setArchives(archiveService.getArchives())), [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      setDeleteError('')
      archiveService.archiveProduct(deleteTarget)
      setDeleteTarget(null)
      setArchives(archiveService.getArchives())
    } catch (err) {
      setDeleteError(toDisplayMessage(err, 'Failed to delete.'))
    } finally {
      setDeleting(false)
    }
  }

  // ---- If viewing a single product detail ----
  if (selectedGun) {
    return (
      <GunDetail
        gun={selectedGun}
        onBack={() => setSelectedGun(null)}
        onEdit={!isLocalMode && onNavigate ? (g) => onNavigate('Edit', g) : undefined}
        onArchive={(g) => { setSelectedGun(null); setDeleteTarget(g) }}
      />
    )
  }

  // ---- Main catalog view ----
  return (
    <>
      <section className="masthead">
        <h1 className="display">Hardware, by the spec sheet.</h1>
        <p className="lede">
          A small armory of pistols, rifles, and shotguns. Every piece listed
          with its type, caliber, and price — nothing else.
        </p>
      </section>

      <section>
        <div className="list-head">
          <h2>Current stock</h2>
          <div className="list-head-right">
            <span className="count">
              {visibleGuns.length} piece{visibleGuns.length !== 1 ? 's' : ''}
            </span>
            {onNavigate && !isLocalMode && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => onNavigate('Create')}
              >
                <Plus size={16} /> Add
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <AdvancedFilter
          search={search}
          onSearch={setSearch}
          categories={categories}
          activeCategory={activeCategory}
          onCategory={setActiveCategory}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={({ key, order }) => { setSortKey(key); setSortOrder(order) }}
        />

        {/* States */}
        {loading && (
          <div className="state-box">
            <Loader size={28} className="spin" />
            <p>Loading products…</p>
          </div>
        )}

        {!loading && isLocalMode && (
          <div className="local-banner" role="status">
            <span>
              {API_CONFIGURED ? (
                <>API unavailable: {toDisplayMessage(error, 'Unable to fetch products.')} Showing local demo data; editing is disabled.</>
              ) : (
                <>API backend is not configured. Showing local demo data; editing is disabled. Set VITE_API_BASE_URL in Vercel to enable the live catalog.</>
              )}
            </span>
            {API_CONFIGURED && (
              <button type="button" className="link-btn" onClick={refetch}>
                <RefreshCw size={14} /> Retry API
              </button>
            )}
          </div>
        )}

        {!loading && visibleGuns.length === 0 && !isLocalMode && !error && (
          <div className="state-box">
            <PackageOpen size={28} />
            <p>No products match your search.</p>
          </div>
        )}

        {/* Product grid */}
        {visibleGuns.length > 0 && (
          <ul className="stock">
            {visibleGuns.map((gun) => (
              <GunCard
                key={gun.id || gun.name}
                gun={gun}
                onSelect={setSelectedGun}
                onEdit={!isLocalMode && onNavigate ? (g) => onNavigate('Edit', g) : undefined}
                onArchive={setDeleteTarget}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Archive Product"
        message={`Move "${deleteTarget?.name}" to your profile archive? You can restore it later.`}
        confirmLabel="Archive"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setDeleteError('') }}
      />
      {deleteError && (
        <div className="toast toast--error">{deleteError}</div>
      )}
    </>
  )
}
