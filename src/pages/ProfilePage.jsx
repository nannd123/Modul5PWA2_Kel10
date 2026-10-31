import { useEffect, useState } from 'react'
import {
  Archive,
  Camera,
  Check,
  Copy,
  FileText,
  Heart,
  Play,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import About from './About'
import Contact from './Contact'
import userService from '../services/userService'
import archiveService from '../services/archiveService'
import { useFavorites } from '../hooks/useFavorites'
import { getAllDrafts, deleteDraft, formatDraftTime } from '../utils/draftStorage'

const SECTIONS = ['Overview', 'Drafts', 'Archive', 'About', 'Contact']

export default function ProfilePage({ onReplaySplash, onEditProfile, onResumeDraft }) {
  const [profile, setProfile] = useState(() => userService.getUserProfile())
  const [avatar, setAvatar] = useState(profile.avatar || null)
  const [section, setSection] = useState('Overview')
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [drafts, setDrafts] = useState(getAllDrafts)
  const [archives, setArchives] = useState(archiveService.getArchives)
  const { favorites } = useFavorites()

  useEffect(() => archiveService.subscribe(() => setArchives(archiveService.getArchives())), [])

  const refreshDrafts = () => setDrafts(getAllDrafts())
  const notify = (message) => {
    setFeedback(message)
    window.setTimeout(() => setFeedback(''), 3000)
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      notify('Avatar image must be under 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = userService.updateAvatar(reader.result)
      if (!result.success) {
        notify(result.message || 'Failed to save avatar.')
        return
      }
      setAvatar(reader.result)
      setProfile(result.data)
      notify('Avatar updated.')
    }
    reader.onerror = () => notify('Could not read the selected image.')
    reader.readAsDataURL(file)
  }

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(profile.userId)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      notify('Could not copy the user ID.')
    }
  }

  const handleDeleteDraft = (id) => {
    if (!deleteDraft(id)) {
      notify('Failed to remove draft.')
      return
    }
    refreshDrafts()
  }

  const handleRestoreArchive = (id) => {
    archiveService.restoreProduct(id)
    setArchives(archiveService.getArchives())
  }

  return (
    <div className="profile-page">
      <section className="masthead profile-masthead">
        <div>
          <h1 className="display">Operator Profile</h1>
          <p className="lede">Your account, saved drafts, and archived products.</p>
        </div>
        {onReplaySplash && (
          <button type="button" className="btn btn--outline btn--sm" onClick={onReplaySplash}>
            <Play size={14} /> Replay Intro
          </button>
        )}
      </section>

      {feedback && <div className="toast toast--success"><Check size={18} /> {feedback}</div>}

      <div className="profile-card">
        <div className="profile-card-top">
          <div className="avatar-wrap">
            {avatar ? (
              <img src={avatar} alt={profile.username} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder"><Camera size={30} /></div>
            )}
            <label htmlFor="avatar-file-input" className="avatar-upload-btn" title="Upload avatar">
              <Camera size={14} />
              <input id="avatar-file-input" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden-file-input" />
            </label>
          </div>
          <div className="profile-identity">
            <h2 className="display">{profile.username || 'Shooter'}</h2>
            <p className="profile-bio">{profile.bio || 'No bio added yet.'}</p>
            <div className="profile-id-row">
              <span className="mono-badge">{profile.userId}</span>
              <button type="button" className="icon-btn" onClick={handleCopyId} title="Copy User ID">
                {copied ? <Check size={14} color="var(--brass)" /> : <Copy size={14} />}
              </button>
            </div>
            {onEditProfile && (
              <button type="button" className="btn btn--outline btn--sm profile-edit-btn" onClick={onEditProfile}>
                Edit name and bio
              </button>
            )}
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <Heart size={20} className="stat-icon" stroke="var(--brass)" />
            <div className="stat-val">{favorites.length}</div>
            <div className="stat-label">Favorites</div>
          </div>
          <div className="stat-item">
            <FileText size={20} className="stat-icon" stroke="var(--steel)" />
            <div className="stat-val">{drafts.length}</div>
            <div className="stat-label">Saved drafts</div>
          </div>
        </div>
      </div>

      <nav className="profile-section-nav" aria-label="Profile sections">
        {SECTIONS.map((item) => (
          <button
            type="button"
            key={item}
            className={`btn btn--sm ${section === item ? 'btn--primary' : 'btn--outline'}`}
            onClick={() => setSection(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      {section === 'Drafts' && (
        <section className="profile-panel">
          <h2 className="section-title">Saved drafts</h2>
          {drafts.length ? (
            <ul className="profile-record-list">
              {drafts.map(({ id, data, savedAt }) => (
                <li className="profile-record" key={id}>
                  <div>
                    <strong>{data.formData?.name || (id === 'create' ? 'New product draft' : `Draft ${id}`)}</strong>
                    <span>{formatDraftTime(savedAt) || 'Saved locally'}</span>
                  </div>
                  <div className="profile-record-actions">
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => onResumeDraft?.(id)}>Resume</button>
                    <button type="button" className="icon-btn" title="Delete draft" onClick={() => handleDeleteDraft(id)}><Trash2 size={16} /></button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="detail-empty">No saved drafts.</p>}
        </section>
      )}

      {section === 'Archive' && (
        <section className="profile-panel">
          <h2 className="section-title">Archived products</h2>
          {archives.length ? (
            <ul className="profile-record-list">
              {archives.map((item) => (
                <li className="profile-record" key={item.id}>
                  <div>
                    <strong>{item.name || 'Unnamed product'}</strong>
                    <span><Archive size={13} /> Archived {new Date(item.archivedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="profile-record-actions">
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => handleRestoreArchive(item.id)}>
                      <RotateCcw size={14} /> Restore
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="detail-empty">No archived products.</p>}
        </section>
      )}

      {section === 'About' && <section className="profile-panel"><About /></section>}
      {section === 'Contact' && <section className="profile-panel"><Contact /></section>}
      {section === 'Overview' && (
        <section className="profile-panel">
          <h2 className="section-title">Profile overview</h2>
          <p>Manage your profile details, review saved drafts, and restore archived products from the sections above.</p>
        </section>
      )}
    </div>
  )
}
