// Authentication utilities for Topic Explorer
import { createClient } from '@supabase/supabase-js'
import { authFallback, sessionManagerFallback, shouldUseFallbackAuth } from './auth-fallback.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we should use fallback authentication
const useFallback = shouldUseFallbackAuth()

// Initialize Supabase client if not using fallback
let supabase = null
if (!useFallback && supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    console.log('Falling back to mock authentication')
  }
}

export { supabase }

// Authentication functions
export const auth = {
  // Sign up new user
  signUp: async (email, password, userData = {}) => {
    if (useFallback || !supabase) {
      return await authFallback.signUp(email, password, userData)
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name || email.split('@')[0],
            ...userData
          }
        }
      })
      return { user: data.user, session: data.session, error }
    } catch (error) {
      console.error('Supabase auth error, falling back to mock:', error)
      return await authFallback.signUp(email, password, userData)
    }
  },

  // Sign in existing user
  signIn: async (email, password) => {
    if (useFallback || !supabase) {
      return await authFallback.signIn(email, password)
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { user: data.user, session: data.session, error }
    } catch (error) {
      console.error('Supabase auth error, falling back to mock:', error)
      return await authFallback.signIn(email, password)
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    if (useFallback || !supabase) {
      return await authFallback.signInWithGoogle()
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { data, error }
    } catch (error) {
      console.error('Supabase OAuth error, falling back to mock:', error)
      return await authFallback.signInWithGoogle()
    }
  },

  // Sign out
  signOut: async () => {
    if (useFallback || !supabase) {
      return await authFallback.signOut()
    }
    
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Supabase signOut error, falling back to mock:', error)
      return await authFallback.signOut()
    }
  },

  // Get current user
  getCurrentUser: async () => {
    if (useFallback || !supabase) {
      return await authFallback.getCurrentUser()
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } catch (error) {
      console.error('Supabase getUser error, falling back to mock:', error)
      return await authFallback.getCurrentUser()
    }
  },

  // Get current session
  getCurrentSession: async () => {
    if (useFallback || !supabase) {
      return await authFallback.getCurrentSession()
    }
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      return { session, error }
    } catch (error) {
      console.error('Supabase getSession error, falling back to mock:', error)
      return await authFallback.getCurrentSession()
    }
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    if (useFallback || !supabase) {
      return authFallback.onAuthStateChange(callback)
    }
    
    try {
      return supabase.auth.onAuthStateChange(callback)
    } catch (error) {
      console.error('Supabase onAuthStateChange error, falling back to mock:', error)
      return authFallback.onAuthStateChange(callback)
    }
  },

  // Reset password
  resetPassword: async (email) => {
    if (useFallback || !supabase) {
      return await authFallback.resetPassword(email)
    }
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      return { data, error }
    } catch (error) {
      console.error('Supabase resetPassword error, falling back to mock:', error)
      return await authFallback.resetPassword(email)
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    if (useFallback || !supabase) {
      return await authFallback.updateProfile(updates)
    }
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })
      return { user: data.user, error }
    } catch (error) {
      console.error('Supabase updateProfile error, falling back to mock:', error)
      return await authFallback.updateProfile(updates)
    }
  }
}

// Session management functions
export const sessionManager = {
  // Create new session
  createSession: async (userId, sessionName = 'New Session') => {
    if (useFallback || !supabase) {
      return await sessionManagerFallback.createSession(userId, sessionName)
    }
    
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_name: sessionName
        })
        .select()
        .single()
      
      return { session: data, error }
    } catch (error) {
      console.error('Supabase session error, falling back to mock:', error)
      return await sessionManagerFallback.createSession(userId, sessionName)
    }
  },

  // Get user's sessions
  getUserSessions: async (userId) => {
    if (useFallback || !supabase) {
      return await sessionManagerFallback.getUserSessions(userId)
    }
    
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_accessed', { ascending: false })
      
      return { sessions: data, error }
    } catch (error) {
      console.error('Supabase session error, falling back to mock:', error)
      return await sessionManagerFallback.getUserSessions(userId)
    }
  },

  // Update session
  updateSession: async (sessionId, updates) => {
    if (useFallback || !supabase) {
      return await sessionManagerFallback.updateSession(sessionId, updates)
    }
    
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single()
      
      return { session: data, error }
    } catch (error) {
      console.error('Supabase session error, falling back to mock:', error)
      return await sessionManagerFallback.updateSession(sessionId, updates)
    }
  },

  // Delete session
  deleteSession: async (sessionId) => {
    if (useFallback || !supabase) {
      return await sessionManagerFallback.deleteSession(sessionId)
    }
    
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId)
      
      return { error }
    } catch (error) {
      console.error('Supabase session error, falling back to mock:', error)
      return await sessionManagerFallback.deleteSession(sessionId)
    }
  },

  // Get session with topic count
  getSessionWithStats: async (sessionId) => {
    if (useFallback || !supabase) {
      return await sessionManagerFallback.getSessionWithStats(sessionId)
    }
    
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          topics:topics(count)
        `)
        .eq('id', sessionId)
        .single()
      
      return { session: data, error }
    } catch (error) {
      console.error('Supabase session error, falling back to mock:', error)
      return await sessionManagerFallback.getSessionWithStats(sessionId)
    }
  }
}

// User profile functions
export const userProfile = {
  // Get user profile
  getProfile: async (userId) => {
    if (useFallback || !supabase) {
      // Return fallback profile for demo users
      return {
        profile: {
          id: userId,
          email: 'demo@example.com',
          name: 'Demo User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      }
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { profile: data, error }
  },

  // Update user profile
  updateProfile: async (userId, updates) => {
    if (useFallback || !supabase) {
      // Return updated fallback profile
      return {
        profile: {
          id: userId,
          email: 'demo@example.com',
          name: updates.name || 'Demo User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...updates
        },
        error: null
      }
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    
    return { profile: data, error }
  },

  // Get user statistics
  getUserStats: async (userId) => {
    if (useFallback || !supabase) {
      // Return fallback stats
      return {
        stats: {
          user_id: userId,
          email: 'demo@example.com',
          name: 'Demo User',
          total_topics: 0,
          total_sessions: 1,
          days_active: 1,
          first_exploration: new Date().toISOString(),
          last_exploration: new Date().toISOString(),
          total_connections: 0
        },
        error: null
      }
    }

    const { data, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    return { stats: data, error }
  }
}

// Migration functions
export const migration = {
  // Migrate anonymous session to user account
  migrateAnonymousSession: async (sessionId, userId, sessionName = 'Migrated Session') => {
    const { data, error } = await supabase
      .rpc('migrate_anonymous_session', {
        p_session_id: sessionId,
        p_user_id: userId,
        p_session_name: sessionName
      })
    
    return { newSessionId: data, error }
  }
}

// Helper functions
export const helpers = {
  // Check if user is authenticated
  isAuthenticated: async () => {
    const { session } = await auth.getCurrentSession()
    return !!session
  },

  // Get user ID from session
  getUserId: async () => {
    const { session } = await auth.getCurrentSession()
    return session?.user?.id || null
  },

  // Format user display name
  formatUserName: (user) => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  }
}