// SM-2 Simplified Spaced Repetition Algorithm
// https://en.wikipedia.org/wiki/SuperMemo

export function calculateNextReview(level) {
  // level 0→1: 1 day
  // level 1→2: 2 days
  // level 2→3: 4 days
  // level 3→4: 8 days
  // level 4→4: 16 days
  const daysMap = {
    0: 1,
    1: 2,
    2: 4,
    3: 8,
    4: 16,
  }
  const days = daysMap[Math.min(level, 4)] || 1
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + days)
  return nextReview
}

export function updateProgress(currentProgress, correct) {
  const updated = { ...currentProgress }

  if (correct) {
    // Correct answer: increase level
    updated.level = Math.min(currentProgress.level + 1, 4)
    updated.streak = (updated.streak || 0) + 1
    updated.next_review = calculateNextReview(updated.level)
  } else {
    // Incorrect answer: decrease level, reset streak, review soon
    updated.level = Math.max(currentProgress.level - 1, 0)
    updated.streak = 0
    // Review in 5 minutes
    const nextReview = new Date()
    nextReview.setMinutes(nextReview.getMinutes() + 5)
    updated.next_review = nextReview
  }

  updated.attempts = (updated.attempts || 0) + 1
  if (correct) {
    updated.correct_count = (updated.correct_count || 0) + 1
  }
  updated.updated_at = new Date()
  updated.last_seen = new Date()

  return updated
}

export function calculateMastery(progress) {
  if (!progress || progress.attempts === 0) return 0
  return Math.min((progress.correct_count / progress.attempts) * 100, 100)
}

export function calculateStreakDays(lastSeen) {
  if (!lastSeen) return 0
  const now = new Date()
  const last = new Date(lastSeen)
  const days = Math.floor((now - last) / (1000 * 60 * 60 * 24))
  return days > 365 ? 0 : Math.max(0, days) // reset if more than a year
}
