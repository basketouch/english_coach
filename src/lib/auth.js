import { supabase } from './supabase'

// Simple login (no magic link needed for testing)
export async function signInWithEmail(email) {
  // For development: just store email and create a fake user
  const user = {
    id: 'dev-' + Math.random().toString(36).substr(2, 9),
    email,
    user_metadata: {}
  }
  localStorage.setItem('ec-user', JSON.stringify(user))
  return { user }
}

export async function signInWithMagicLink(email) {
  const { error, data } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null)
  })
  return data?.subscription || { unsubscribe: () => {} }
}
