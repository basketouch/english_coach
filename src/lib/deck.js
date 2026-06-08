import { loadConcepts, loadProgress } from './progress'

// Weights for each level (how often they appear)
const LEVEL_WEIGHTS = {
  0: 10, // unknown: appears very often
  1: 5,  // learning
  2: 2,  // familiar
  3: 1,  // advanced
  4: 0.1, // mastered: appears rarely
}

export async function buildDynamicDeck(userId, limit = 50) {
  try {
    // Load all concepts and progress
    const [concepts, progressList] = await Promise.all([
      loadConcepts(userId),
      loadProgress(userId),
    ])

    // Create progress map
    const progressMap = {}
    progressList.forEach(p => {
      progressMap[p.concept_id] = p
    })

    // Filter only terms (not phrases/drills for now)
    const terms = concepts.filter(c => c.type === 'term')

    // Assign weights
    const weighted = terms.map(term => {
      const progress = progressMap[term.id] || { level: 0 }
      const now = new Date()
      const nextReview = progress.next_review ? new Date(progress.next_review) : null

      // Only include if it's time to review (or no progress yet)
      const isTimeToReview = !nextReview || nextReview <= now

      return {
        ...term,
        progress,
        weight: isTimeToReview ? LEVEL_WEIGHTS[progress.level || 0] : 0,
        isTimeToReview,
      }
    })

    // Filter: keep only items that should be reviewed
    const toReview = weighted.filter(w => w.weight > 0)

    // If not enough, add all with weight > 0.01
    if (toReview.length < 10) {
      weighted.forEach(w => {
        if (w.weight > 0.01 && !toReview.includes(w)) {
          toReview.push(w)
        }
      })
    }

    // Weighted shuffle
    const deck = weightedShuffle(toReview, 'weight').slice(0, limit)

    return deck
  } catch (error) {
    console.error('Error building deck:', error)
    return []
  }
}

// Weighted Fisher-Yates shuffle
function weightedShuffle(items, weightKey) {
  const copy = [...items]
  const result = []

  while (copy.length > 0) {
    // Calculate total weight
    const totalWeight = copy.reduce((sum, item) => sum + item[weightKey], 0)

    // Pick a random weighted item
    let random = Math.random() * totalWeight
    let selected = null
    let selectedIndex = -1

    for (let i = 0; i < copy.length; i++) {
      random -= copy[i][weightKey]
      if (random <= 0) {
        selected = copy[i]
        selectedIndex = i
        break
      }
    }

    if (selected && selectedIndex !== -1) {
      result.push(selected)
      copy.splice(selectedIndex, 1)
    } else if (copy.length > 0) {
      // Fallback: pick first item if rounding error
      result.push(copy[0])
      copy.splice(0, 1)
    }
  }

  return result
}

// Alternative: simple random shuffle for flashcards (less weighted)
export function shuffleForPractice(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, 50)
}
