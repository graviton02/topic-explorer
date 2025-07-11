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

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { session } = await auth.getCurrentSession()
        
        if (session) {
          setSession(session)
          setUser(session.user)
          await loadUserProfile(session.user.id)
          await loadUserSessions(session.user.id)
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
      console.log('Auth state changed:', event, session)
      
      if (session) {
        setSession(session)
        setUser(session.user)
        await loadUserProfile(session.user.id)
        await loadUserSessions(session.user.id)
      } else {
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
      const { user, session, error } = await auth.signUp(email, password, userData)
      if (error) throw error
      
      // Profile creation is handled by database trigger
      return { user, session }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signIn = async (email, password) => {
    try {
      const { user, session, error } = await auth.signIn(email, password)
      if (error) throw error
      
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
    
    // Migration
    migrateAnonymousSession,
    
    // Helpers
    getUserId,
    getSessionToken,
    getAuthHeaders,
    
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