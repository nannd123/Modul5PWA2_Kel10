import { useState, useEffect, useCallback } from 'react'
import reviewService from '../services/reviewService'
import { API_CONFIGURED } from '../config/api'
import { toDisplayMessage } from '../utils/helpers'
import { getCachedQuery, invalidateQuery } from '../utils/queryCache'

// ---------------------------------------------------------------------------
// useReviews — fetch reviews for a specific product.
// ---------------------------------------------------------------------------

export function useReviews(gunId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReviews = useCallback(async (force = false) => {
    if (!API_CONFIGURED || !gunId || String(gunId).startsWith('local-')) {
      setReviews([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)

      const response = await getCachedQuery(
        `reviews:${gunId}`,
        () => reviewService.getReviews(gunId),
        { force },
      )

      if (response.success) {
        setReviews(response.data || [])
      } else {
        setError(toDisplayMessage(response.message, 'Failed to fetch reviews.'))
      }
    } catch (err) {
      setError(toDisplayMessage(err, 'An error occurred while fetching reviews.'))
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [gunId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return { reviews, loading, error, refetch: fetchReviews }
}

// ---------------------------------------------------------------------------
// useCreateReview — submit a new review for a product.
// ---------------------------------------------------------------------------

export function useCreateReview() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const createReview = async (gunId, reviewData) => {
    if (!API_CONFIGURED || String(gunId).startsWith('local-')) {
      setError('Reviews require a connected API backend.')
      return null
    }
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      const response = await reviewService.createReview(gunId, reviewData)

      if (response.success) {
        invalidateQuery(`reviews:${gunId}`)
        setSuccess(true)
        return response.data
      } else {
        setError(toDisplayMessage(response.message, 'Failed to submit review.'))
        return null
      }
    } catch (err) {
      setError(toDisplayMessage(err, 'An error occurred while submitting review.'))
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createReview, loading, error, success }
}

export function useReviewMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateReview = async (reviewId, reviewData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await reviewService.updateReview(reviewId, reviewData)
      if (response.success) {
        invalidateQuery()
        return response.data || true
      }
      throw new Error(toDisplayMessage(response.message, 'Failed to update review.'))
    } catch (err) {
      setError(toDisplayMessage(err, 'Failed to update review.'))
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteReview = async (reviewId) => {
    try {
      setLoading(true)
      setError(null)
      const response = await reviewService.deleteReview(reviewId)
      if (response.success) {
        invalidateQuery()
        return true
      }
      throw new Error(toDisplayMessage(response.message, 'Failed to delete review.'))
    } catch (err) {
      setError(toDisplayMessage(err, 'Failed to delete review.'))
      return false
    } finally {
      setLoading(false)
    }
  }

  return { updateReview, deleteReview, loading, error }
}
