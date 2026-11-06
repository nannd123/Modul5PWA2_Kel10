import { useState } from 'react'
import FavoriteButton from '../common/FavoriteButton'
import { formatPrice, truncate } from '../../utils/helpers'
import { Archive, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Product card used in the catalog grid.
 *
 * @param {Object}   props
 * @param {Object}   props.gun       — product data
 * @param {Function} props.onSelect  — called with the gun when clicked
 * @param {Function} [props.onEdit]  — called when Edit is clicked (admin)
 * @param {Function} [props.onArchive] — called when Archive is clicked
 */
export default function GunCard({ gun, onSelect, onEdit, onArchive }) {
  const imageUrls = [
    ...(Array.isArray(gun.images) ? gun.images : []),
    gun.image_url || gun.image,
  ].filter((url, index, urls) => typeof url === 'string' && url && urls.indexOf(url) === index)
  const images = imageUrls.length ? imageUrls : ['/guns/pistol.svg']
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const activeImageIndex = Math.min(selectedImageIndex, images.length - 1)
  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0

  return (
    <li className="card">
      <button
        type="button"
        className="card-btn"
        onClick={() => onSelect(gun)}
        aria-label={`View ${gun.name}`}
      >
        <img
          className="card-img"
          src={images[activeImageIndex]}
          alt={`${gun.name}, image ${activeImageIndex + 1} of ${images.length}`}
          width="240"
          height="180"
          loading="lazy"
        />

        <span className="name display">{gun.name}</span>

        <span className="type">
          {category}
          {caliber ? ` · ${caliber}` : ''}
        </span>

        {gun.description && (
          <span className="card-desc">{truncate(gun.description, 72)}</span>
        )}

        <span className="price">{formatPrice(price)}</span>
      </button>

      {images.length > 1 && (
        <div className="card-gallery-controls" aria-label={`${gun.name} images`}>
          <button
            type="button"
            className="card-gallery-btn"
            onClick={() => setSelectedImageIndex((activeImageIndex - 1 + images.length) % images.length)}
            aria-label={`Show previous image of ${gun.name}`}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="card-gallery-count" aria-live="polite">
            {activeImageIndex + 1} / {images.length}
          </span>
          <button
            type="button"
            className="card-gallery-btn"
            onClick={() => setSelectedImageIndex((activeImageIndex + 1) % images.length)}
            aria-label={`Show next image of ${gun.name}`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Floating actions row */}
      <div className="card-actions">
        <FavoriteButton gunId={gun.id || gun.name} />

        {onEdit && (
          <button
            type="button"
            className="card-act-btn"
            onClick={(e) => { e.stopPropagation(); onEdit(gun) }}
            aria-label={`Edit ${gun.name}`}
            title="Edit"
          >
            ✏️
          </button>
        )}

        {onArchive && (
          <button
            type="button"
            className="card-act-btn card-act-btn--danger"
            onClick={(e) => { e.stopPropagation(); onArchive(gun) }}
            aria-label={`Archive ${gun.name}`}
            title="Archive"
          >
            <Archive size={16} />
          </button>
        )}
      </div>
    </li>
  )
}
