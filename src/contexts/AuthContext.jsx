import { createContext, useContext, useEffect, useState } from 'react'
import { auth, sessionManager, userProfile, migration } from '../lib/auth'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [userSessions, setUserSessions] = useState([])
  const [currentUserSession, setCurrentUserSession] = useState(null)
  
  // Session timeout management
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [sessionTimeoutId, setSessionTimeoutId] = useState(null)
  const SESSION_TIMEOUT = 15 * 60 * 1000 // 15 minutes in milliseconds

  // Auto-create new session when user becomes active after timeout
  const createNewAutoSession = async () => {
    if (user && isRealAuthenticatedUser()) {
      try {
        const timestamp = new Date().toLocaleString()
        const sessionName = `Session ${timestamp}`
        const newSession = await createNewSession(sessionName)
        console.log('Auto-created new session:', newSession)
        return newSession
      } catch (error) {
        console.error('Failed to auto-create session:', error)
        return null
      }
    }
    return null
  }

  // Reset session timeout timer
  const resetSessionTimeout = () => {
    setLastActivity(Date.now())
    
    // Clear existing timeout
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId)
    }
    
    // Only set timeout for authenticated users with real sessions
    if (user && isRealAuthenticatedUser() && currentUserSession) {
      const timeoutId = setTimeout(() => {
        console.log('Session timed out due to inactivity')
        setCurrentUserSession(null) // End current session, but keep user logged in
      }, SESSION_TIMEOUT)
      
      setSessionTimeoutId(timeoutId)
    }
  }

  // Track user activity
  const trackActivity = () => {
    resetSessionTimeout()
  }

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check Supabase connection status
        console.log('Initializing authentication...')
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...')
        console.log('Supabase Key available:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
        console.log('Fallback auth enabled:', import.meta.env.VITE_USE_FALLBACK_AUTH)
        
        const { session } = await auth.getCurrentSession()
        
        if (session) {
          console.log('Found existing session on init:', session.user?.id)
          setSession(session)
          setUser(session.user)
          await loadUserProfile(session.user.id)
          await loadUserSessions(session.user.id)
        } else {
          console.log('No existing session found on init')
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id || 'no session')
      
      if (session) {
        console.log('Session details - user ID:', session.user?.id)
        console.log('Session details - email:', session.user?.email)
        console.log('Session details - token available:', !!session.access_token)
      }
      
      // Prevent infinite loops by ignoring certain events
      if (event === 'TOKEN_REFRESHED' || event === 'SESSION_UPDATED') {
        // Just update session silently without triggering profile/session loads
        if (session) {
          setSession(session)
          setUser(session.user)
        }
        return
      }
      
      if (session) {
        setSession(session)
        setUser(session.user)
        console.log('Loading user profile and sessions for user:', session.user.id)
        await loadUserProfile(session.user.id)
        await loadUserSessions(session.user.id)
      } else {
        console.log('No session - clearing user state')
        setSession(null)
        setUser(null)
        setProfile(null)
        setUserSessions([])
        setCurrentUserSession(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Set up activity tracking and session management
  useEffect(() => {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      trackActivity()
    }
    
    // Add event listeners for user activity
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })
    
    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, track activity and potentially create new session
        trackActivity()
        
        // If user is authenticated but has no current session, auto-create one
        if (user && isRealAuthenticatedUser() && !currentUserSession) {
          createNewAutoSession()
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Initialize session timeout when user is logged in
    if (user && currentUserSession) {
      resetSessionTimeout()
    }
    
    return () => {
      // Clean up event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      // Clear timeout
      if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId)
      }
    }
  }, [user, currentUserSession, sessionTimeoutId])

  // Auto-create session when user first authenticates
  useEffect(() => {
    const autoCreateInitialSession = async () => {
      if (user && isRealAuthenticatedUser() && userSessions.length === 0) {
        await createNewAutoSession()
      }
    }
    
    autoCreateInitialSession()
  }, [user, userSessions])

  // Load user profile
  const loadUserProfile = async (userId) => {
    try {
      const { profile, error } = await userProfile.getProfile(userId)
      if (error) {
        console.error('Error loading profile:', error)
        return
      }
      setProfile(profile)
    } catch (error) {
      console.error('Profile loading error:', error)
    }
  }

  // Load user sessions
  const loadUserSessions = async (userId) => {
    try {
      const { sessions, error } = await sessionManager.getUserSessions(userId)
      if (error) {
        console.error('Error loading sessions:', error)
        return
      }
      setUserSessions(sessions || [])
      
      // Set current session to the most recently accessed one
      if (sessions && sessions.length > 0) {
        setCurrentUserSession(sessions[0])
      }
    } catch (error) {
      console.error('Sessions loading error:', error)
    }
  }

  // Auth methods
  const signUp = async (email, password, userData = {}) => {
    try {
      console.log('Starting sign-up process for:', email)
      const { user, session, error } = await auth.signUp(email, password, userData)
      
      if (error) {
        console.error('Supabase sign-up error:', error)
        throw error
      }
      
      if (user) {
        console.log('User created successfully:', user.id, user.email)
        console.log('Session created:', session ? 'yes' : 'no')
        
        // Check if user appears in auth table
        try {
          const { session: currentSession } = await auth.getCurrentSession()
          console.log('Current session after sign-up:', currentSession ? 'exists' : 'missing')
        } catch (sessionError) {
          console.error('Error checking session after sign-up:', sessionError)
        }
      } else {
        console.warn('Sign-up returned no user object')
      }
      
      // Profile creation is handled by database trigger
      return { user, session }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('Starting sign-in process for:', email)
      const { user, session, error } = await auth.signIn(email, password)
      
      if (error) {
        console.error('Supabase sign-in error:', error)
        throw error
      }
      
      if (user && session) {
        console.log('User signed in successfully:', user.id, user.email)
        console.log('Session token available:', session.access_token ? 'yes' : 'no')
        console.log('Token starts with:', session.access_token?.substring(0, 20) + '...')
      } else {
        console.warn('Sign-in returned incomplete data - user:', !!user, 'session:', !!session)
      }
      
      return { user, session }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await auth.signInWithGoogle()
      if (error) throw error
      return data
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await auth.resetPassword(email)
      if (error) throw error
      return data
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  const updateUserProfile = async (updates) => {
    try {
      const { profile: updatedProfile, error } = await userProfile.updateProfile(user.id, updates)
      if (error) throw error
      
      setProfile(updatedProfile)
      return updatedProfile
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }

  // Session methods
  const createNewSession = async (sessionName) => {
    try {
      const { session, error } = await sessionManager.createSession(user.id, sessionName)
      if (error) throw error
      
      await loadUserSessions(user.id)
      setCurrentUserSession(session)
      return session
    } catch (error) {
      console.error('Create session error:', error)
      throw error
    }
  }

  const updateSession = async (sessionId, updates) => {
    try {
      const { session, error } = await sessionManager.updateSession(sessionId, updates)
      if (error) throw error
      
      await loadUserSessions(user.id)
      return session
    } catch (error) {
      console.error('Update session error:', error)
      throw error
    }
  }

  const deleteSession = async (sessionId) => {
    try {
      const { error } = await sessionManager.deleteSession(sessionId)
      if (error) throw error
      
      await loadUserSessions(user.id)
      
      // If we deleted the current session, switch to another one
      if (currentUserSession?.id === sessionId) {
        const remainingSessions = userSessions.filter(s => s.id !== sessionId)
        setCurrentUserSession(remainingSessions[0] || null)
      }
    } catch (error) {
      console.error('Delete session error:', error)
      throw error
    }
  }

  const switchSession = (session) => {
    setCurrentUserSession(session)
  }

  // Migration method
  const migrateAnonymousSession = async (sessionId, sessionName = 'Migrated Session') => {
    try {
      if (!user) throw new Error('User must be authenticated to migrate session')
      
      const { newSessionId, error } = await migration.migrateAnonymousSession(
        sessionId,
        user.id,
        sessionName
      )
      if (error) throw error
      
      await loadUserSessions(user.id)
      
      // Find and set the migrated session as current
      const migratedSession = userSessions.find(s => s.id === newSessionId)
      if (migratedSession) {
        setCurrentUserSession(migratedSession)
      }
      
      return newSessionId
    } catch (error) {
      console.error('Migration error:', error)
      throw error
    }
  }

  // Helper methods
  const isAuthenticated = !!user
  const getUserId = () => user?.id || null
  const getSessionToken = () => session?.access_token || null
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${getSessionToken()}`,
    'Content-Type': 'application/json'
  })
  
  // Check if user is a real authenticated user (not demo/fallback)
  const isRealAuthenticatedUser = () => {
    // If user exists and we're not in fallback mode, consider them real authenticated
    if (user && user.id && !user.id.startsWith('demo-user-') && !user.id.startsWith('mock-user-')) {
      // Additional check: if session exists, make sure it's not a demo token
      if (session) {
        return !session.access_token?.startsWith('demo-token') && 
               !session.access_token?.startsWith('mock-session-')
      }
      // If no session but user exists with valid ID, still consider them authenticated
      // This handles cases where session might be temporarily missing during auth flow
      return true
    }
    return false
  }

  const value = {
    // State
    user,
    session,
    loading,
    profile,
    userSessions,
    currentUserSession,
    isAuthenticated,
    
    // Auth methods
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUserProfile,
    
    // Session methods
    createNewSession,
    updateSession,
    deleteSession,
    switchSession,
    createNewAutoSession,
    trackActivity,
    
    // Migration
    migrateAnonymousSession,
    
    // Helpers
    getUserId,
    getSessionToken,
    getAuthHeaders,
    isRealAuthenticatedUser,
    
    // Reload methods
    loadUserProfile,
    loadUserSessions
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}