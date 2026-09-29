import { useEffect, useState } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<SupabaseClient | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let alive = true

    const pending = getSupabase()
    if (!pending) {
      setLoading(false)
      return
    }

    void pending.then(async (sb) => {
      if (!alive) return
      setClient(sb)
      const { data } = await sb.auth.getSession()
      if (!alive) return
      setSession(data.session)
      setLoading(false)

      const { data: sub } = sb.auth.onAuthStateChange((_event, s) => setSession(s))
      unsubscribe = () => sub.subscription.unsubscribe()
    })

    return () => {
      alive = false
      unsubscribe?.()
    }
  }, [])

  async function signIn(email: string, password: string) {
    const sb = client ?? (await getSupabase())
    if (!sb) throw new Error('Supabase no está configurado.')
    const { error } = await sb.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  async function signOut() {
    const sb = client ?? (await getSupabase())
    await sb?.auth.signOut()
  }

  return { session, loading, signIn, signOut, user: session?.user ?? null }
}
