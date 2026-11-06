import { useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Star, Send, Loader, Share2, ThumbsDown, ThumbsUp, Trash2, Pencil } from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import { useReviews, useCreateReview, useReviewMutations } from '../../hooks/useReviews'
import { API_CONFIGURED } from '../../config/api'
import { getUserIdentifier } from '../../services/userService'
import { formatPrice, averageRating } from '../../utils/helpers'
import reviewVoteService from '../../services/reviewVoteService'

/**
 * Full-screen product detail view.
 *
 * @param {Object}   props
 * @param {Object}   props.gun       — product data
 * @param {Function} props.onBack    — return to catalog
 * @param {Function} [props.onEdit]  — navigate to edit page
 * @param {Function} [props.onDelete]— trigger delete flow
 */
export default function GunDetail({ gun, onBack, onEdit, onArchive }) {
  const imageUrls = Array.isArray(gun.images) && gun.images.length
    ? gun.images
    : [gun.image_url || gun.image || '/guns/pistol.svg']
  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0
  const canReview = Boolean(API_CONFIGURED && gun.id && !String(gun.id).startsWith('local-'))

  // Reviews
  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useReviews(gun.id)
  const { createReview, loading: submitting } = useCreateReview()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [editingReview, setEditingReview] = useState(null)
  const [voteRevision, setVoteRevision] = useState(0)
  const [shareMessage, setShareMessage] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const imageTouchStart = useRef(null)
  const { updateReview, deleteReview, loading: changingReview } = useReviewMutations()

  const activeImageIndex = Math.min(selectedImageIndex, imageUrls.length - 1)
  const activeImage = imageUrls[activeImageIndex]

  const handleImageTouchStart = (event) => {
    if (event.touches.length !== 1 || imageUrls.length < 2) {
      imageTouchStart.current = null
      return
    }

    const touch = event.touches[0]
    imageTouchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleImageTouchEnd = (event) => {
    const start = imageTouchStart.current
    imageTouchStart.current = null
    if (!start || imageUrls.length < 2) return

    const touch = event.changedTouches[0]
    if (!touch) return
    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) return

    const direction = deltaX < 0 ? 1 : -1
    setSelectedImageIndex((activeImageIndex + direction + imageUrls.length) % imageUrls.length)
  }

  const avgRating = gun.average_rating || averageRating(reviews)
  const reviewCount = gun.review_count ?? reviews.length

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess('')

    if (rating < 1 || rating > 5) {
      setReviewError('Rating must be between 1 and 5.')
      return
    }

    const reviewData = {
      user_identifier: getUserIdentifier(),
      rating,
      comment: comment.trim(),
    }
    const result = editingReview
      ? await updateReview(editingReview.id, reviewData)
      : await createReview(gun.id, reviewData)

    if (result) {
      setReviewSuccess(editingReview ? 'Review updated!' : 'Review submitted!')
      setComment('')
      setRating(5)
      setEditingReview(null)
      refetchReviews()
    } else {
      setReviewError(editingReview ? 'Could not update review.' : 'Could not submit review. The server may be unavailable.')
    }
  }

  const handleShare = async () => {
    const url = new URL(window.location.href)
    url.searchParams.set('gun', String(gun.id))
    try {
      await navigator.clipboard.writeText(url.toString())
      setShareMessage('Share link copied.')
    } catch {
      setShareMessage('Could not copy the share link. Check browser clipboard permissions.')
    }
    window.setTimeout(() => setShareMessage(''), 3000)
  }

  const handleDeleteReview = async (review) => {
    if (!window.confirm('Delete your review?')) return
    const deleted = await deleteReview(review.id)
    if (deleted) refetchReviews()
    else setReviewError('Could not delete review.')
  }

  const handleVote = (reviewId, vote) => {
    try {
      reviewVoteService.setVote(reviewId, getUserIdentifier(), vote)
      setVoteRevision((revision) => revision + 1)
    } catch {
      setReviewError('Could not save your vote on this device.')
    }
  }

  return (
    <div className="detail">
      {/* Back button */}
      <button type="button" className="detail-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Catalog
      </button>

      {/* Hero */}
      <div className="detail-hero">
        <div className="detail-media">
          <img
            className="detail-img"
            src={activeImage}
            alt={`${gun.name}, image ${activeImageIndex + 1} of ${imageUrls.length}`}
            onTouchStart={handleImageTouchStart}
            onTouchEnd={handleImageTouchEnd}
          />
          {imageUrls.length > 1 && (
            <>
              <div className="detail-gallery-controls" aria-label={`${gun.name} images`}>
                <button
                  type="button"
                  className="detail-gallery-btn"
                  onClick={() => setSelectedImageIndex((activeImageIndex - 1 + imageUrls.length) % imageUrls.length)}
                  aria-label={`Show previous image of ${gun.name}`}
                >
                  <ChevronLeft size={22} />
                </button>
                <span className="detail-gallery-count" aria-live="polite">
                  {activeImageIndex + 1} / {imageUrls.length}
                </span>
                <button
                  type="button"
                  className="detail-gallery-btn"
                  onClick={() => setSelectedImageIndex((activeImageIndex + 1) % imageUrls.length)}
                  aria-label={`Show next image of ${gun.name}`}
                >
                  <ChevronRight size={22} />
                </button>
              </div>
              <div className="detail-thumbnails" aria-label="Product images">
                {imageUrls.map((url, index) => (
                  <button
                    type="button"
                    className={`detail-thumbnail ${activeImageIndex === index ? 'active' : ''}`}
                    key={`${url}-${index}`}
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`Show product image ${index + 1}`}
                    aria-pressed={activeImageIndex === index}
                  >
                    <img src={url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="detail-info">
          <h1 className="display">{gun.name}</h1>
          <p className="type">
            {category}
            {caliber ? ` · ${caliber}` : ''}
          </p>
          <p className="price detail-price">{formatPrice(price)}</p>

          {avgRating > 0 && (
            <p className="detail-rating">
              <Star size={16} fill="var(--brass)" stroke="var(--brass)" />
              {avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
            </p>
          )}

          <div className="detail-actions">
            <FavoriteButton gunId={gun.id || gun.name} />
            <button type="button" className="btn btn--outline" onClick={handleShare}>
              <Share2 size={16} /> Share link
            </button>
            {onEdit && (
              <button type="button" className="btn btn--outline" onClick={() => onEdit(gun)}>
                Edit
              </button>
            )}
            {onArchive && (
              <button type="button" className="btn btn--danger" onClick={() => onArchive(gun)}>
                Archive
              </button>
            )}
          </div>
          {shareMessage && <p className="form-hint" role="status">{shareMessage}</p>}
        </div>
      </div>

      {/* Description */}
      <section className="detail-section">
        <h2>Description</h2>
        <p>{gun.description || 'No description available.'}</p>
      </section>

      {/* Specifications (from ingredients / steps if present) */}
      {gun.ingredients && gun.ingredients.length > 0 && (
        <section className="detail-section">
          <h2>Specifications</h2>
          <ul className="detail-specs">
            {gun.ingredients.map((ing, i) => (
              <li key={ing.id || i}>
                <strong>{ing.name}</strong> — {ing.quantity}
              </li>
            ))}
          </ul>
        </section>
      )}

      {gun.steps && gun.steps.length > 0 && (
        <section className="detail-section">
          <h2>Assembly / Maintenance Steps</h2>
          <ol className="detail-steps">
            {gun.steps.map((step, i) => (
              <li key={step.id || i}>
                {step.instruction || step}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Reviews Section */}
      <section className="detail-section">
        <h2>Reviews</h2>

        {/* Submit review */}
        {canReview ? (<form className="review-form" onSubmit={handleSubmitReview}>
          <h3 className="section-title">{editingReview ? 'Edit your review' : 'Write a review'}</h3>
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="star-btn"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
              >
                <Star
                  size={22}
                  fill={n <= rating ? 'var(--brass)' : 'none'}
                  stroke={n <= rating ? 'var(--brass)' : 'var(--steel)'}
                />
              </button>
            ))}
          </div>

          <textarea
            className="review-input"
            rows="3"
            placeholder="Write a short review (optional)…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />

          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting || changingReview || !gun.id}
          >
            {submitting || changingReview ? (
              <><Loader size={16} className="spin" /> Saving…</>
            ) : (
              <><Send size={16} /> {editingReview ? 'Save Review' : 'Submit Review'}</>
            )}
          </button>
          {editingReview && (
            <button type="button" className="btn btn--outline btn--sm" onClick={() => {
              setEditingReview(null)
              setComment('')
              setRating(5)
            }}>Cancel edit</button>
          )}

          {reviewError && <p className="form-error">{reviewError}</p>}
          {reviewSuccess && <p className="form-success">{reviewSuccess}</p>}
          {!gun.id && (
            <p className="form-hint">
              Reviews require a server-generated product ID. This product is local-only.
            </p>
          )}
        </form>) : (<p className="detail-empty">Reviews are unavailable for local demo items.</p>)}

        {/* Existing reviews */}
        {canReview && (reviewsLoading ? (
          <p className="detail-loading">Loading reviews…</p>
        ) : reviews.length > 0 ? (
          <ul className="review-list">
            {reviews.map((rev) => (
              <li key={rev.id} className="review-item">
                <div className="review-head">
                  <span className="review-user">{rev.user_identifier || 'Anonymous'}</span>
                  <span className="review-stars-display">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < rev.rating ? 'var(--brass)' : 'none'}
                        stroke={i < rev.rating ? 'var(--brass)' : 'var(--line)'}
                      />
                    ))}
                  </span>
                </div>
                {rev.comment && <p className="review-comment">{rev.comment}</p>}
                <div className="review-controls" data-vote-revision={voteRevision}>
                  {(() => {
                    const votes = reviewVoteService.countsFor(rev.id, getUserIdentifier())
                    return (
                      <>
                        <button type="button" className={`review-vote ${votes.mine === 'up' ? 'active' : ''}`} onClick={() => handleVote(rev.id, 'up')} aria-label="Thumbs up">
                          <ThumbsUp size={15} /> {votes.up}
                        </button>
                        <button type="button" className={`review-vote ${votes.mine === 'down' ? 'active' : ''}`} onClick={() => handleVote(rev.id, 'down')} aria-label="Thumbs down">
                          <ThumbsDown size={15} /> {votes.down}
                        </button>
                      </>
                    )
                  })()}
                  {(rev.owner_id === getUserIdentifier() || rev.user_identifier === getUserIdentifier()) && (
                    <>
                      <button type="button" className="review-vote" onClick={() => {
                        setEditingReview(rev)
                        setRating(rev.rating)
                        setComment(rev.comment || '')
                        setReviewError('')
                        setReviewSuccess('')
                        window.scrollTo({ top: document.querySelector('.review-form')?.offsetTop || 0, behavior: 'smooth' })
                      }} aria-label="Edit your review"><Pencil size={14} /> Edit</button>
                      <button type="button" className="review-vote" onClick={() => handleDeleteReview(rev)} aria-label="Delete your review"><Trash2 size={14} /> Delete</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="detail-empty">No reviews yet. Be the first!</p>
        ))}
      </section>
    </div>
  )
}
