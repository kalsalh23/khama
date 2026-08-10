import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/lib/types"

interface AuthState {
  user: import("@supabase/supabase-js").User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  initialize: () => Promise<void>
  refreshProfile: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
  return (data as Profile) ?? null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user ?? null
    let profile: Profile | null = null
    if (user) {
      profile = await fetchProfile(user.id)
    }
    set({ user, profile, loading: false, initialized: true })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      let p: Profile | null = null
      if (u) {
        p = await fetchProfile(u.id)
        if (!p) {
          await supabase
            .from("profiles")
            .insert({ id: u.id, email: u.email ?? "", full_name: u.user_metadata?.full_name })
            .select()
            .then(({ data }) => {
              p = (data?.[0] as Profile) ?? null
            })
        }
      }
      set({ user: u, profile: p, loading: false })
    })
  },

  refreshProfile: async () => {
    const u = get().user
    if (!u) return
    const profile = await fetchProfile(u.id)
    if (profile) set({ profile })
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  },

  signUp: async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName ?? "" } },
    })
    if (error) return { error: error.message }
    return { error: null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))
