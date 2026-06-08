import { supabase } from './supabase'

// Load all progress for a user
export async function loadProgress(userId) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}

// Get progress for a specific concept
export async function getProgressForConcept(userId, conceptId) {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .eq('concept_id', conceptId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data || { level: 0, streak: 0, attempts: 0, correct_count: 0 }
}

// Save/upsert progress
export async function saveProgress(userId, conceptId, progress) {
  const { data, error } = await supabase
    .from('progress')
    .upsert(
      {
        user_id: userId,
        concept_id: conceptId,
        ...progress,
      },
      { onConflict: 'user_id,concept_id' }
    )
    .select()

  if (error) throw error
  return data?.[0]
}

// Load all concepts (base + user's personal)
export async function loadConcepts(userId) {
  const { data, error } = await supabase
    .from('concepts')
    .select('*')
    .eq('status', 'approved')
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// Get next concepts to review
export async function getConceptsToReview(userId, limit = 20) {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('progress')
    .select('concept_id, level, next_review')
    .eq('user_id', userId)
    .lte('next_review', now)
    .order('level', { ascending: true })
    .order('next_review', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data || []
}

// Get user statistics
export async function getUserStats(userId) {
  const { data, error } = await supabase
    .from('progress')
    .select('level, streak, attempts, correct_count')
    .eq('user_id', userId)

  if (error) throw error

  const stats = data || []
  const totalAttempts = stats.reduce((sum, s) => sum + (s.attempts || 0), 0)
  const totalCorrect = stats.reduce((sum, s) => sum + (s.correct_count || 0), 0)
  const maxStreak = Math.max(...stats.map(s => s.streak || 0), 0)
  const masteredCount = stats.filter(s => s.level === 4).length

  return {
    totalTerms: stats.length,
    masteredCount,
    totalAttempts,
    totalCorrect,
    masteryPercent: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    maxStreak,
  }
}

// Get progress by category
export async function getProgressByCategory(userId) {
  const { data: progress, error: progressError } = await supabase
    .from('progress')
    .select('concept_id')
    .eq('user_id', userId)

  if (progressError) throw progressError

  const { data: concepts, error: conceptError } = await supabase
    .from('concepts')
    .select('id, category, status')
    .eq('status', 'approved')
    .or(`user_id.is.null,user_id.eq.${userId}`)

  if (conceptError) throw conceptError

  // Map concepts by category
  const progressedIds = new Set(progress?.map(p => p.concept_id) || [])
  const categorized = {}

  concepts?.forEach(concept => {
    if (!categorized[concept.category]) {
      categorized[concept.category] = { total: 0, completed: 0 }
    }
    categorized[concept.category].total += 1
    if (progressedIds.has(concept.id)) {
      categorized[concept.category].completed += 1
    }
  })

  return Object.entries(categorized).map(([category, stats]) => ({
    category,
    percent: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    completed: stats.completed,
    total: stats.total,
  }))
}
