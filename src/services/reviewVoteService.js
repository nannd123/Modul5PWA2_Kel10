const STORAGE_KEY = 'bore_barrel_review_votes'

const readVotes = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return stored && typeof stored === 'object' ? stored : {}
  } catch {
    return {}
  }
}

const reviewVoteService = {
  setVote(reviewId, userId, vote) {
    const allVotes = readVotes()
    allVotes[reviewId] ||= {}
    allVotes[reviewId][userId] = allVotes[reviewId][userId] === vote ? null : vote
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allVotes))
    return this.countsFor(reviewId, userId)
  },

  countsFor(reviewId, userId) {
    const votes = Object.values(readVotes()[reviewId] || {})
    return {
      up: votes.filter((vote) => vote === 'up').length,
      down: votes.filter((vote) => vote === 'down').length,
      mine: readVotes()[reviewId]?.[userId] || null,
    }
  },
}

export default reviewVoteService
