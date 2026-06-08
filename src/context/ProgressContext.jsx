import { createContext, useState, useEffect, useCallback, useContext as reactUseContext } from 'react'
import { AuthContext } from './AuthContext'
import { loadProgress, saveProgress as saveProgressDb, loadConcepts } from '../lib/progress'
import { seedConcepts } from '../lib/seed'

export const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const auth = reactUseContext(AuthContext)
  const [progress, setProgress] = useState({}) // { conceptId: progressData }
  const [concepts, setConcepts] = useState([]) // all concepts
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)

  // Load concepts and progress when user logs in
  useEffect(() => {
    if (!auth?.user?.id) return

    const loadData = async () => {
      setLoading(true)
      try {
        // Seed concepts first (only once, will be skipped if already exist)
        if (!seeded) {
          try {
            await seedConcepts()
            setSeeded(true)
          } catch (seedError) {
            console.warn('Seed error (may already exist):', seedError.message)
            setSeeded(true) // continue anyway
          }
        }

        // Load concepts
        const conceptsData = await loadConcepts(auth.user.id)
        setConcepts(conceptsData || [])

        // Load progress
        const progressData = await loadProgress(auth.user.id)
        const progressMap = {}
        ;(progressData || []).forEach(p => {
          progressMap[p.concept_id] = p
        })
        setProgress(progressMap)
      } catch (error) {
        console.error('Error loading progress:', error)
        // Don't block app on progress error
        setConcepts([])
        setProgress({})
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [auth?.user?.id])

  // Save progress for a concept
  const updateProgress = useCallback(
    async (conceptId, updated) => {
      if (!auth?.user?.id) return

      try {
        // Save to DB
        await saveProgressDb(auth.user.id, conceptId, updated)

        // Update local state
        setProgress(prev => ({
          ...prev,
          [conceptId]: updated,
        }))
      } catch (error) {
        console.error('Error saving progress:', error)
      }
    },
    [auth?.user?.id]
  )

  // Get progress for a concept (or default empty)
  const getProgress = useCallback(
    (conceptId) => {
      return (
        progress[conceptId] || {
          level: 0,
          streak: 0,
          attempts: 0,
          correct_count: 0,
          next_review: new Date().toISOString(),
        }
      )
    },
    [progress]
  )

  return (
    <ProgressContext.Provider
      value={{
        progress,
        concepts,
        loading,
        updateProgress,
        getProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = reactUseContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider')
  }
  return context
}
