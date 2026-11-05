import { lazy, Suspense, useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import PWABadge from './components/PWABadge.jsx'
import ConfirmModal from './components/modals/ConfirmModal.jsx'
import SplashScreen from './components/common/SplashScreen.jsx'
import archiveService from './services/archiveService.js'
import gunService from './services/gunService.js'
import userService from './services/userService.js'
import GUNS_LOCAL from './data/guns.js'
import { API_CONFIGURED } from './config/api.js'
import './App.css'

const Catalog = lazy(() => import('./pages/Catalog.jsx'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'))
const MerchandisePage = lazy(() => import('./pages/MerchandisePage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const ProfileEditPage = lazy(() => import('./pages/ProfileEditPage.jsx'))
const CreateGunPage = lazy(() => import('./pages/CreateGunPage.jsx'))
const EditGunPage = lazy(() => import('./pages/EditGunPage.jsx'))
const GunDetail = lazy(() => import('./components/gun/GunDetail.jsx'))

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [tab, setTab] = useState('Catalog')
  const [mode, setMode] = useState('list') // 'list' | 'create' | 'edit' | 'detail'
  const [selectedGun, setSelectedGun] = useState(null)
  const [editingGun, setEditingGun] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [sharedLinkError, setSharedLinkError] = useState('')

  useEffect(() => {
    const sharedId = new URLSearchParams(window.location.search).get('gun')
    if (!sharedId) return

    let active = true
    const openSharedProduct = async () => {
      try {
        let product
        if (sharedId.startsWith('local-')) {
          const index = Number(sharedId.slice('local-'.length))
          const local = GUNS_LOCAL[index]
          if (local) product = { ...local, id: sharedId }
        } else if (API_CONFIGURED) {
          const response = await gunService.getGunById(sharedId)
          if (response.success) product = response.data
        }
        if (!active) return
        if (product) {
          setSelectedGun(product)
          setMode('detail')
          setTab('Catalog')
        } else {
          setSharedLinkError('This shared product could not be found.')
        }
      } catch {
        if (active) setSharedLinkError('Could not load the shared product. Please try again later.')
      }
    }

    openSharedProduct()
    return () => { active = false }
  }, [])

  // Unified navigation handler
  const handleNavigate = (target, payload) => {
    if (target === 'Create') {
      setMode('create')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Edit') {
      setEditingGun(payload)
      setMode('edit')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Detail') {
      setSelectedGun(payload)
      setMode('detail')
      const url = new URL(window.location.href)
      url.searchParams.set('gun', String(payload.id))
      window.history.replaceState({}, '', url)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Tab change
      setTab(target)
      setMode('list')
      setSelectedGun(null)
      setEditingGun(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBackToList = () => {
    setMode('list')
    setSelectedGun(null)
    setEditingGun(null)
    const url = new URL(window.location.href)
    url.searchParams.delete('gun')
    window.history.replaceState({}, '', url)
  }

  return (
    <div className="shell">
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      <Header
        tab={mode === 'list' ? tab : ''}
        onTab={(newTab) => handleNavigate(newTab)}
        onNavigateCreate={API_CONFIGURED ? () => handleNavigate('Create') : undefined}
      />

      <main className="main">
        <Suspense fallback={<div className="state-box" role="status">Loading page…</div>}>
        {sharedLinkError && <div className="local-banner" role="alert">{sharedLinkError}</div>}
        {/* Sub-page views */}
        {mode === 'create' && (
          <CreateGunPage
            onBack={handleBackToList}
            onSuccess={() => {
              handleBackToList()
              setTab('Catalog')
            }}
          />
        )}

        {mode === 'edit' && (
          <EditGunPage
            gun={editingGun}
            gunId={editingGun?.id}
            onBack={handleBackToList}
            onSuccess={() => {
              handleBackToList()
              setTab('Catalog')
            }}
          />
        )}

        {mode === 'detail' && selectedGun && (
          <GunDetail
            gun={selectedGun}
            onBack={handleBackToList}
            onEdit={API_CONFIGURED && !String(selectedGun.id).startsWith('local-') ? (g) => handleNavigate('Edit', g) : undefined}
            onArchive={(g) => setDeleteTarget(g)}
          />
        )}

        {mode === 'profile-edit' && (
          <ProfileEditPage
            profile={userService.getUserProfile()}
            onBack={() => setMode('list')}
            onSave={() => {
              setMode('list')
              setTab('Profile')
            }}
          />
        )}

        {/* Top-level Tabs */}
        {mode === 'list' && (
          <>
            {tab === 'Catalog' && (
              <Catalog
                onNavigate={(destination, payload) => handleNavigate(destination, payload)}
              />
            )}
            {tab === 'Favorites' && (
              <FavoritesPage
                onSelectGun={(g) => handleNavigate('Detail', g)}
                onNavigateCatalog={() => setTab('Catalog')}
              />
            )}
            {tab === 'Merchandise' && <MerchandisePage />}
            {tab === 'Profile' && (
              <ProfilePage
                onReplaySplash={() => setShowSplash(true)}
                onEditProfile={() => setMode('profile-edit')}
                onResumeDraft={(id) => {
                  if (id === 'create') {
                    setMode('create')
                  } else {
                    setEditingGun({ id })
                    setMode('edit')
                  }
                }}
              />
            )}
          </>
        )}
        </Suspense>
      </main>

      {/* Global Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Archive product"
        message={`Move "${deleteTarget?.name}" to your profile archive? You can restore it later.`}
        confirmLabel="Archive"
        danger
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            setDeleting(true)
            archiveService.archiveProduct(deleteTarget)
            setDeleteTarget(null)
            handleBackToList()
            setTab('Catalog')
          } catch (err) {
            alert(err.message || 'Failed to archive product.')
          } finally {
            setDeleting(false)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <PWABadge />
      <Footer />
    </div>
  )
}

export default App
