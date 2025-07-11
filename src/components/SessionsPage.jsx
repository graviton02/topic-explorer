import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserSessions, createUserSession, updateUserSession, deleteUserSession } from '../lib/api';

const SessionsPage = ({ onNavigate, onShowAuth }) => {
  const { user, getAuthHeaders, loading } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [editingSession, setEditingSession] = useState(null);
  const [editSessionName, setEditSessionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (user) {
        loadSessions();
      } else {
        setIsLoading(false);
      }
    }
  }, [user, loading]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const authHeaders = getAuthHeaders();
      const sessionsData = await fetchUserSessions(authHeaders);
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;
    
    try {
      setIsCreating(true);
      const authHeaders = getAuthHeaders();
      const newSession = await createUserSession(newSessionName, authHeaders);
      setSessions([newSession, ...sessions]);
      setNewSessionName('');
      setShowNewSessionModal(false);
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      setIsDeleting(sessionId);
      const authHeaders = getAuthHeaders();
      await deleteUserSession(sessionId, authHeaders);
      setSessions(sessions.filter(session => session.id !== sessionId));
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete session');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleExploreSession = (sessionId) => {
    // Navigate to main dashboard with selected session
    if (onNavigate) {
      onNavigate('dashboard', { sessionId });
    }
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setEditSessionName(session.session_name);
  };

  const handleSaveEdit = async () => {
    if (!editSessionName.trim() || !editingSession) return;
    
    try {
      const authHeaders = getAuthHeaders();
      const updatedSession = await updateUserSession(editingSession.id, editSessionName, authHeaders);
      setSessions(sessions.map(session => 
        session.id === editingSession.id ? updatedSession : session
      ));
      setEditingSession(null);
      setEditSessionName('');
    } catch (err) {
      console.error('Error updating session:', err);
      setError('Failed to update session');
    }
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
    setEditSessionName('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTopicCount = (session) => {
    return session.topics && session.topics.length > 0 ? session.topics[0].count : 0;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen" style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
      }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-700/50 rounded-xl p-6 h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen" style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
      }}>
        {/* Header Navigation */}
        <header className="border-b border-gray-800/50 bg-gray-900/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-white">StudyAI</h1>
              </div>
              
              {/* Navigation Menu */}
              <nav className="flex items-center space-x-8">
                <button 
                  onClick={() => onNavigate?.('dashboard')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Dashboard
                </button>
                <button className="text-blue-400 font-medium">
                  Sessions
                </button>
                <button 
                  onClick={() => onNavigate?.('profile')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Profile
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Login Prompt */}
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Sessions are for Registered Users</h2>
            <p className="text-gray-300 mb-8">Sign in to create and manage your topic exploration sessions</p>
            
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-left">
              <h3 className="text-lg font-semibold text-white mb-4">With Sessions, you can:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Organize your topics into different sessions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Track your exploration progress</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access your history from any device</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Create unlimited sessions and topics</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-8 flex justify-center space-x-4">
              <button 
                onClick={() => onShowAuth?.()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => onNavigate?.('dashboard')}
                className="px-6 py-3 bg-gray-800/50 border border-gray-600 text-white rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
    }}>
      {/* Header Navigation */}
      <header className="border-b border-gray-800/50 bg-gray-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">StudyAI</h1>
            </div>
            
            {/* Navigation Menu */}
            <nav className="flex items-center space-x-8">
              <button 
                onClick={() => onNavigate?.('dashboard')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button className="text-blue-400 font-medium">
                Sessions
              </button>
              <button 
                onClick={() => onNavigate?.('profile')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Profile
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 3v5H4L9 3zM15 3v5h5L15 3z" />
                </svg>
              </button>
              {user && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-white">Your Sessions</h2>
          <button 
            onClick={() => setShowNewSessionModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>New Session</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <div 
              key={session.id}
              className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/60 transition-all duration-200"
            >
              {/* Session Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {editingSession?.id === session.id ? (
                    <input
                      type="text"
                      value={editSessionName}
                      onChange={(e) => setEditSessionName(e.target.value)}
                      className="text-xl font-semibold text-white bg-gray-700/50 border border-gray-600 rounded px-2 py-1 mb-2 w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-xl font-semibold text-white mb-2">{session.session_name}</h3>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{getTopicCount(session)} Topics</span>
                    <span>•</span>
                    <span>Last accessed: {formatDate(session.last_accessed)}</span>
                  </div>
                </div>
                <div className="text-2xl">📚</div>
              </div>

              {/* Topic Preview */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: Math.min(getTopicCount(session), 3) }, (_, index) => (
                    <div 
                      key={index}
                      className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30"
                    >
                      <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full"></div>
                    </div>
                  ))}
                  {getTopicCount(session) > 3 && (
                    <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center border border-gray-600">
                      <span className="text-xs text-gray-400">+{getTopicCount(session) - 3}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                {editingSession?.id === session.id ? (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleSaveEdit}
                      className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                      title="Save Changes"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                      title="Cancel Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleEditSession(session)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                      title="Edit Session"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={isDeleting === session.id}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Session"
                    >
                      {isDeleting === session.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
                {editingSession?.id !== session.id && (
                  <button 
                    onClick={() => handleExploreSession(session.id)}
                    className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 transition-colors"
                  >
                    Explore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sessions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Sessions Yet</h3>
            <p className="text-gray-400 mb-4">Create your first session to start organizing your topics</p>
            <button 
              onClick={() => setShowNewSessionModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Session
            </button>
          </div>
        )}
      </div>

      {/* New Session Modal */}
      {showNewSessionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/90 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Session</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Session Name
              </label>
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Enter session name..."
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                autoFocus
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowNewSessionModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                disabled={!newSessionName.trim() || isCreating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsPage;