// Fallback authentication system for development when Supabase is unavailable
// This provides a temporary solution while Supabase issues are resolved

// Mock user data for development
const mockUsers = new Map();

// Generate a simple session token
const generateSessionToken = () => {
  return 'mock-session-' + Math.random().toString(36).substr(2, 9);
};

// Mock authentication functions
export const authFallback = {
  // Sign up new user
  signUp: async (email, password, userData = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    if (mockUsers.has(email)) {
      return { 
        user: null, 
        session: null, 
        error: { message: 'User already exists' } 
      };
    }
    
    // Create mock user
    const user = {
      id: 'mock-user-' + Date.now(),
      email,
      user_metadata: {
        name: userData.name || email.split('@')[0],
        ...userData
      },
      created_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString() // Auto-confirm for development
    };
    
    // Store user with password (in real app, this would be hashed)
    mockUsers.set(email, { user, password });
    
    // Create session
    const session = {
      user,
      access_token: generateSessionToken(),
      refresh_token: generateSessionToken(),
      expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      expires_in: 24 * 60 * 60 // 24 hours in seconds
    };
    
    // Store session in localStorage for persistence
    localStorage.setItem('mock-session', JSON.stringify(session));
    
    // Trigger auth state change if callback is available
    if (authFallback._authCallback) {
      authFallback._authCallback('SIGNED_UP', session);
    }
    
    return { user, session, error: null };
  },

  // Sign in existing user
  signIn: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedUser = mockUsers.get(email);
    if (!storedUser || storedUser.password !== password) {
      return { 
        user: null, 
        session: null, 
        error: { message: 'Invalid credentials' } 
      };
    }
    
    const session = {
      user: storedUser.user,
      access_token: generateSessionToken(),
      refresh_token: generateSessionToken(),
      expires_at: Date.now() + (24 * 60 * 60 * 1000),
      expires_in: 24 * 60 * 60
    };
    
    localStorage.setItem('mock-session', JSON.stringify(session));
    
    // Trigger auth state change if callback is available
    if (authFallback._authCallback) {
      authFallback._authCallback('SIGNED_IN', session);
    }
    
    return { user: storedUser.user, session, error: null };
  },

  // Sign in with Google (mock)
  signInWithGoogle: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create mock Google user
    const email = 'user@gmail.com';
    const user = {
      id: 'mock-google-user-' + Date.now(),
      email,
      user_metadata: {
        name: 'Google User',
        provider: 'google'
      },
      created_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString()
    };
    
    mockUsers.set(email, { user, password: null });
    
    const session = {
      user,
      access_token: generateSessionToken(),
      refresh_token: generateSessionToken(),
      expires_at: Date.now() + (24 * 60 * 60 * 1000),
      expires_in: 24 * 60 * 60
    };
    
    localStorage.setItem('mock-session', JSON.stringify(session));
    
    // Trigger auth state change if callback is available
    if (authFallback._authCallback) {
      authFallback._authCallback('SIGNED_IN', session);
    }
    
    return { data: { session }, error: null };
  },

  // Sign out
  signOut: async () => {
    localStorage.removeItem('mock-session');
    
    // Trigger auth state change if callback is available
    if (authFallback._authCallback) {
      authFallback._authCallback('SIGNED_OUT', null);
    }
    
    return { error: null };
  },

  // Get current user
  getCurrentUser: async () => {
    const session = localStorage.getItem('mock-session');
    if (!session) {
      return { user: null, error: null };
    }
    
    try {
      const parsedSession = JSON.parse(session);
      if (parsedSession.expires_at < Date.now()) {
        localStorage.removeItem('mock-session');
        return { user: null, error: null };
      }
      
      return { user: parsedSession.user, error: null };
    } catch (error) {
      return { user: null, error: { message: 'Invalid session' } };
    }
  },

  // Get current session
  getCurrentSession: async () => {
    const session = localStorage.getItem('mock-session');
    if (!session) {
      return { session: null, error: null };
    }
    
    try {
      const parsedSession = JSON.parse(session);
      if (parsedSession.expires_at < Date.now()) {
        localStorage.removeItem('mock-session');
        return { session: null, error: null };
      }
      
      return { session: parsedSession, error: null };
    } catch (error) {
      return { session: null, error: { message: 'Invalid session' } };
    }
  },

  // Listen to auth changes (mock)
  onAuthStateChange: (callback) => {
    // Store the callback for manual triggering when auth state actually changes
    authFallback._authCallback = callback;
    
    // Only trigger initial state check
    setTimeout(async () => {
      const { session } = await authFallback.getCurrentSession();
      callback('SIGNED_IN', session);
    }, 100);
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            authFallback._authCallback = null;
          }
        }
      }
    };
  },

  // Reset password (mock)
  resetPassword: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (mockUsers.has(email)) {
      console.log(`Password reset email sent to ${email} (mock)`);
      return { data: { message: 'Password reset email sent' }, error: null };
    }
    
    return { data: null, error: { message: 'User not found' } };
  },

  // Update user profile (mock)
  updateProfile: async (updates) => {
    const { session } = await authFallback.getCurrentSession();
    if (!session) {
      return { user: null, error: { message: 'Not authenticated' } };
    }
    
    const updatedUser = {
      ...session.user,
      user_metadata: {
        ...session.user.user_metadata,
        ...updates
      }
    };
    
    const updatedSession = {
      ...session,
      user: updatedUser
    };
    
    localStorage.setItem('mock-session', JSON.stringify(updatedSession));
    
    return { user: updatedUser, error: null };
  }
};

// Mock session storage
const mockSessions = new Map();

// Mock session management functions
export const sessionManagerFallback = {
  // Create new session
  createSession: async (userId, sessionName = 'New Session') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const session = {
      id: 'mock-session-' + Date.now(),
      user_id: userId,
      session_name: sessionName,
      created_at: new Date().toISOString(),
      last_accessed: new Date().toISOString(),
      is_active: true
    };
    
    mockSessions.set(session.id, session);
    
    return { session, error: null };
  },

  // Get user's sessions
  getUserSessions: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const sessions = Array.from(mockSessions.values())
      .filter(session => session.user_id === userId && session.is_active)
      .sort((a, b) => new Date(b.last_accessed) - new Date(a.last_accessed));
    
    return { sessions, error: null };
  },

  // Update session
  updateSession: async (sessionId, updates) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const session = mockSessions.get(sessionId);
    if (!session) {
      return { session: null, error: { message: 'Session not found' } };
    }
    
    const updatedSession = {
      ...session,
      ...updates,
      last_accessed: new Date().toISOString()
    };
    
    mockSessions.set(sessionId, updatedSession);
    
    return { session: updatedSession, error: null };
  },

  // Delete session
  deleteSession: async (sessionId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const session = mockSessions.get(sessionId);
    if (!session) {
      return { error: { message: 'Session not found' } };
    }
    
    const updatedSession = {
      ...session,
      is_active: false,
      last_accessed: new Date().toISOString()
    };
    
    mockSessions.set(sessionId, updatedSession);
    
    return { error: null };
  },

  // Get session with stats
  getSessionWithStats: async (sessionId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const session = mockSessions.get(sessionId);
    if (!session) {
      return { session: null, error: { message: 'Session not found' } };
    }
    
    // Mock topic count
    const sessionWithStats = {
      ...session,
      topics: [{ count: Math.floor(Math.random() * 20) + 1 }]
    };
    
    return { session: sessionWithStats, error: null };
  }
};

// Check if we should use fallback auth
export const shouldUseFallbackAuth = () => {
  // Use fallback if environment variable is set or if we detect Supabase issues
  return process.env.VITE_USE_FALLBACK_AUTH === 'true' || 
         !process.env.VITE_SUPABASE_URL || 
         !process.env.VITE_SUPABASE_ANON_KEY;
};