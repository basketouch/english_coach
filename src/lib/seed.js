import { supabase } from './supabase'
import BBALL from '../content'

export async function seedConcepts() {
  const concepts = []

  // Agregar términos de vocabulario
  BBALL.categories.forEach((cat) => {
    cat.terms.forEach((term) => {
      concepts.push({
        user_id: null, // base concepts
        type: 'term',
        category: cat.es,
        en: term.en,
        es: term.es,
        say: term.say || '',
        note: term.note || null,
        status: 'approved',
      })
    })
  })

  // Agregar frases
  BBALL.phraseGroups.forEach((group) => {
    group.items.forEach((item) => {
      concepts.push({
        user_id: null,
        type: 'phrase',
        category: group.es,
        en: item.en,
        es: item.es,
        say: item.say || '',
        note: null,
        status: 'approved',
      })
    })
  })

  // Agregar drills
  BBALL.drills.forEach((drill) => {
    concepts.push({
      user_id: null,
      type: 'drill',
      category: 'Ejercicios',
      en: drill.en,
      es: drill.es,
      say: '',
      note: drill.meta,
      status: 'approved',
    })
  })

  // Insertar en Supabase
  const { error } = await supabase
    .from('concepts')
    .insert(concepts, { onConflict: 'ignore' })

  if (error) {
    console.error('Error seeding concepts:', error)
    throw error
  }

  console.log(`✓ Seeded ${concepts.length} concepts`)
  return concepts.length
}
