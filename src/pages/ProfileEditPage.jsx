import { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import userService from '../services/userService'

export default function ProfileEditPage({ profile, onBack, onSave }) {
  const [username, setUsername] = useState(profile.username || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = userService.saveUserProfile({ ...profile, username: username.trim(), bio: bio.trim() })
    if (!result.success) {
      setError(result.message || 'Failed to save profile.')
      return
    }
    onSave(result.data)
  }

  return (
    <section className="profile-page">
      <button type="button" className="detail-back" onClick={onBack}><ArrowLeft size={18} /> Back to Profile</button>
      <header className="masthead">
        <h1 className="display">Edit profile</h1>
        <p className="lede">Update your display name and bio.</p>
      </header>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="edit-profile-name" className="form-label">Name</label>
          <input id="edit-profile-name" className="form-input" value={username} onChange={(event) => setUsername(event.target.value)} maxLength={60} required />
        </div>
        <div className="form-group">
          <label htmlFor="edit-profile-bio" className="form-label">Bio</label>
          <textarea id="edit-profile-bio" className="form-textarea" value={bio} onChange={(event) => setBio(event.target.value)} rows={4} maxLength={300} />
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="profile-record-actions">
          <button type="submit" className="btn btn--primary"><Save size={16} /> Save changes</button>
          <button type="button" className="btn btn--outline" onClick={onBack}>Cancel</button>
        </div>
      </form>
    </section>
  )
}
